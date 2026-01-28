import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  login as apiLogin, 
  register as apiRegister,
  verifyToken as apiVerifyToken,
  requestPasswordReset,
  verifyRecoveryCode,
  resetPassword as apiResetPassword,
} from '../services/api';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Verificar token al cargar la app
  useEffect(() => {
    const verificarSesionGuardada = async () => {
      const tokenGuardado = localStorage.getItem('token');
      const usuarioGuardado = localStorage.getItem('user');
      
      if (tokenGuardado && usuarioGuardado) {
        try {
          console.log('Verificando sesión guardada...');
          
          // Intentar verificar token con backend
          const response = await apiVerifyToken(tokenGuardado);
          
          if (response.success && response.valid) {
            console.log('Sesión válida encontrada');
            setUsuario(JSON.parse(usuarioGuardado));
            setToken(tokenGuardado);
          } else {
            console.log('Sesión inválida, limpiando...');
            limpiarSesion();
          }
        } catch (error) {
          console.error('Error verificando sesión:', error);
          limpiarSesion();
        }
      }
      
      setCargando(false);
    };
    
    verificarSesionGuardada();
  }, []);

  // Limpiar sesión
  const limpiarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUsuario(null);
    setToken(null);
  };

  // LOGIN
  const login = async (email, password) => {
    try {
      console.log('Intentando login:', email);
      
      const response = await apiLogin(email, password);
      
      if (response.success) {
        // Guardar en localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Actualizar estado
        setUsuario(response.user);
        setToken(response.token);
        
        console.log('Login exitoso:', response.user.email);
        toast.success('¡Bienvenido al sistema!');
        
        return { success: true, user: response.user };
      } else {
        toast.error(response.error || 'Credenciales incorrectas');
        return { 
          success: false, 
          error: response.error || 'Error en login' 
        };
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast.error(error.error || 'Error de conexión');
      return { 
        success: false, 
        error: error.error || 'Error de conexión' 
      };
    }
  };
  
  // REGISTRO
  const registro = async (datosUsuario) => {
    try {
      const response = await apiRegister(datosUsuario);
      
      if (response.success) {
        toast.success('Registro exitoso. Ahora puedes iniciar sesión.');
        return { success: true, data: response };
      } else {
        toast.error(response.error || 'Error en el registro');
        return { 
          success: false, 
          error: response.error || 'Error en registro' 
        };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      toast.error(error.error || 'Error de conexión');
      return { 
        success: false, 
        error: error.error || 'Error de conexión' 
      };
    }
  };

  // RECUPERACIÓN: usar las funciones del servicio unificado
  const forgotPassword = async (email) => {
    try {
      return await requestPasswordReset(email);
    } catch (err) {
      console.error('Error en forgotPassword:', err);
      return { success: false, error: err.message || 'Error de conexión' };
    }
  };

  const verifyRecovery = async (email, code) => {
    try {
      return await verifyRecoveryCode(email, code);
    } catch (err) {
      console.error('Error en verifyRecovery:', err);
      return { success: false, error: err.message || 'Error de conexión' };
    }
  };

  const resetPassword = async (email, codeOrToken, nuevaPassword) => {
    try {
      return await apiResetPassword(email, codeOrToken, nuevaPassword);
    } catch (err) {
      console.error('Error en resetPassword:', err);
      return { success: false, error: err.message || 'Error de conexión' };
    }
  };

  // LOGOUT
  const logout = () => {
    limpiarSesion();
    toast.success('Sesión cerrada exitosamente');
    window.location.href = '/login';
  };

  // VERIFICAR SI ESTÁ AUTENTICADO
  const estaAutenticado = () => {
    const tieneUsuario = !!usuario;
    const tieneToken = !!token;
    const tokenEnLocalStorage = !!localStorage.getItem('token');
    
    return tieneUsuario && tieneToken && tokenEnLocalStorage;
  };

  // VERIFICAR ROL
  const hasRole = (rol) => {
    return usuario?.rol === rol;
  };

  // OBTENER TOKEN
  const getToken = () => {
    return token;
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      cargando,
      token,
      login,
      registro,
      forgotPassword,
      verifyRecovery,
      resetPassword,
      logout,
      estaAutenticado,
      hasRole,
      getToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};