// AuthContext.js - VERSIÓN CORREGIDA
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  login as apiLogin, 
  register as apiRegister,
  verifyToken as apiVerifyToken,
  requestPasswordReset as apiRequestPasswordReset,
  verifyRecoveryCode as apiVerifyRecoveryCode,
  resetPassword as apiResetPassword
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
          console.log('🔍 Verificando sesión guardada...');
          
          // Intentar verificar token con backend
          const response = await apiVerifyToken(tokenGuardado);
          
          if (response.success && response.valid) {
            console.log('✅ Sesión válida encontrada');
            setUsuario(JSON.parse(usuarioGuardado));
            setToken(tokenGuardado);
          } else {
            console.log('❌ Sesión inválida, limpiando...');
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
      console.log('🔐 Intentando login:', email);
      
      const response = await apiLogin(email, password);
      
      if (response.success) {
        // Guardar en localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Actualizar estado
        setUsuario(response.user);
        setToken(response.token);
        
        console.log('✅ Login exitoso:', response.user.email);
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
      console.error('🔥 Error en login:', error);
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

  // ================= NUEVAS FUNCIONES PARA RECUPERACIÓN =================

  // SOLICITAR RECUPERACIÓN
  const forgotPassword = async (email) => {
    try {
      console.log('📧 Solicitando recuperación para:', email);
      
      const response = await apiRequestPasswordReset(email);
      
      if (response.success) {
        return { 
          success: true, 
          message: response.message,
          codigo: response.codigo // Solo en desarrollo
        };
      } else {
        toast.error(response.error || 'Error al solicitar recuperación');
        return { 
          success: false, 
          error: response.error || 'Error al solicitar recuperación' 
        };
      }
    } catch (error) {
      console.error('Error en forgotPassword:', error);
      toast.error('Error de conexión');
      return { 
        success: false, 
        error: 'Error de conexión' 
      };
    }
  };

  // VERIFICAR CÓDIGO DE RECUPERACIÓN
  const verifyRecovery = async (email, codigo) => {
    try {
      console.log('🔑 Verificando código:', codigo, 'para:', email);
      
      const response = await apiVerifyRecoveryCode(email, codigo);
      
      if (response.success) {
        return { 
          success: true, 
          resetToken: response.resetToken 
        };
      } else {
        toast.error(response.error || 'Código incorrecto');
        return { 
          success: false, 
          error: response.error || 'Código incorrecto' 
        };
      }
    } catch (error) {
      console.error('Error en verifyRecovery:', error);
      toast.error('Error de conexión');
      return { 
        success: false, 
        error: 'Error de conexión' 
      };
    }
  };

  // RESTABLECER CONTRASEÑA
  const resetPassword = async (resetToken, nuevaPassword) => {
    try {
      console.log('🔄 Restableciendo contraseña...');
      
      const response = await apiResetPassword(resetToken, nuevaPassword);
      
      if (response.success) {
        toast.success('Contraseña actualizada exitosamente');
        return { success: true };
      } else {
        toast.error(response.error || 'Error al actualizar contraseña');
        return { 
          success: false, 
          error: response.error || 'Error al actualizar contraseña' 
        };
      }
    } catch (error) {
      console.error('Error en resetPassword:', error);
      toast.error('Error de conexión');
      return { 
        success: false, 
        error: 'Error de conexión' 
      };
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
      forgotPassword,    // ¡AGREGADA!
      verifyRecovery,    // ¡AGREGADA!
      resetPassword,     // ¡AGREGADA!
      logout,
      estaAutenticado,
      hasRole,
      getToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};