import axios from 'axios';

const ROOT = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const API_URL = `${ROOT}/api`;
console.log('📡 API_URL ->', API_URL);

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
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    console.log(`📤 ${config.method.toUpperCase()}: ${config.baseURL}${config.url}`);
    if (config.data) console.log('📦 Datos:', config.data);
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
    return response.data;
  },
  (error) => {
    const errorData = error.response?.data || { error: error.message };
    console.error('❌ Error en respuesta:', errorData);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(errorData);
  }
);

// ====================== FUNCIONES DE AUTH ======================

export const login = async (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const register = async (userData) => {
  return api.post('/auth/register', userData);
};

export const verifyToken = async (token) => {
  return api.get('/auth/verify-token', {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Solicitar código: body { email }
export const requestPasswordReset = async (email) => {
  return api.post('/auth/forgot-password', { email });
};

// Verificar código: body { email, code }
export const verifyRecoveryCode = async (email, code) => {
  return api.post('/auth/verify-recovery-code', { email, code });
};

// Resetear contraseña: body { email, code, newPassword }
export const resetPassword = async (email, code, newPassword) => {
  return api.post('/auth/reset-password', { email, code, newPassword });
};

export const getCurrentUser = async () => {
  return api.get('/auth/me');
};

// ====================== FUNCIONES PARA POSTULANTE ======================
export const getPerfilPostulante = async () => api.get('/postulante/perfil');
export const updatePerfilPostulante = async (datosPerfil) => api.post('/postulante/perfil', datosPerfil);
export const getEstadoPostulacion = async () => api.get('/postulante/estado');
export const verificarPerfilCompleto = async () => api.get('/postulante/verificar-perfil');


// ====================== RRHH ======================

export const getPostulantesRRHH = async () => {
  return api.get('/rrhh/postulantes');
};

export const getPasantesRRHH = async () => {
  return api.get('/rrhh/pasantes');
};

export const getDepartamentosRRHH = async () => {
  return api.get('/rrhh/departamentos');
};

export const getJefesPorDepartamentoRRHH = async (departamentoId) => {
  return api.get(`/rrhh/jefes/${departamentoId}`);
};

export const asignarPasanteRRHH = async (data) => {
  return api.post('/rrhh/asignar-pasante', data);
};

export const getDocumentosPostulanteRRHH = async (postulanteCi) => {
  return api.get(`/rrhh/documentos/${postulanteCi}`);
};

export const descargarDocumentoPostulanteRRHH = async (postulanteCi, tipo) => {
  return api.get(`/rrhh/documentos/${postulanteCi}/${tipo}`, {
    responseType: 'blob'
  });
};




// ====================== DEPARTAMENTOS RRHH ======================

export const getResumenDepartamentosRRHH = async () => {
  return api.get('/rrhh/departamentos/resumen');
};

export const getPasantesPorDepartamentoRRHH = async (departamentoId) => {
  return api.get(`/rrhh/departamentos/${departamentoId}/pasantes`);
};


export default api;