import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Crear instancia principal de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para debug y agregar token
api.interceptors.request.use(
  (config) => {
    // Agregar token si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`📤 ${config.method.toUpperCase()}: ${config.baseURL}${config.url}`);
    if (config.data) {
      console.log('📦 Datos:', config.data);
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respuestas
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} de: ${response.config.url}`);
    return response.data; // Retornar solo data
  },
  (error) => {
    const errorData = error.response?.data || { error: error.message };
    console.error('❌ Error en respuesta:', errorData);
    
    // Manejar token expirado
    if (error.response?.status === 401) {
      console.log('🔒 Token inválido, limpiando...');
      localStorage.removeItem('token');
      // No redirigir automáticamente para no romper el flujo de login
    }
    
    return Promise.reject(errorData);
  }
);

// ====================== FUNCIONES DE AUTH ======================

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response;
  } catch (error) {
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const verifyToken = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/auth/verify-token`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error verificando token' };
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response;
  } catch (error) {
    throw error;
  }
};

export const verifyRecoveryCode = async (email, codigo) => {
  try {
    const response = await api.post('/auth/verify-recovery-code', { 
      email, 
      codigo 
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (resetToken, newPassword) => {
  try {
    const response = await api.post('/auth/reset-password', { 
      resetToken, 
      newPassword 
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response;
  } catch (error) {
    throw error;
  }
};

// ====================== FUNCIONES PARA POSTULANTE ======================

export const getPerfilPostulante = async () => {
  try {
    const response = await api.get('/postulante/perfil');
    return response;
  } catch (error) {
    throw error;
  }
};

export const updatePerfilPostulante = async (datosPerfil) => {
  try {
    const response = await api.post('/postulante/perfil', datosPerfil);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getEstadoPostulacion = async () => {
  try {
    const response = await api.get('/postulante/estado');
    return response;
  } catch (error) {
    throw error;
  }
};

export const verificarPerfilCompleto = async () => {
  try {
    const response = await api.get('/postulante/verificar-perfil');
    return response;
  } catch (error) {
    throw error;
  }
};

export default api;