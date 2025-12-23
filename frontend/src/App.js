import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Componentes de Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';


import Layout from './components/common/Layout';
import DashboardPostulante from './components/postulante/DashboardPostulante';


const MiPerfil = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h2>Mi Perfil</h2>
    <p>Esta sección estará disponible pronto</p>
  </div>
);

const MisDocumentos = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h2>Mis Documentos</h2>
    <p>Aquí podrás subir y ver tus documentos</p>
  </div>
);

const MisEntrevistas = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h2>Mis Entrevistas</h2>
    <p>Visualiza tus entrevistas programadas</p>
  </div>
);

// Componente de Loading
const LoadingScreen = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    background: '#1a1a2e',
    color: 'white'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid #3498db',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }}></div>
      <p>Cargando sistema de pasantías...</p>
    </div>
  </div>
);


const ProtectedRoute = ({ children }) => {
  const { usuario, cargando, estaAutenticado } = useAuth();
  
  if (cargando) {
    return <LoadingScreen />;
  }
  
  if (!estaAutenticado()) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Componente principal de la aplicación
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
 
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Ruta por defecto */}
            <Route index element={<Navigate to="/dashboard" />} />
            
            {/* Dashboard principal */}
            <Route path="dashboard" element={<DashboardPostulante />} />
            
            {/* Módulos para POSTULANTE */}
            <Route path="mi-perfil" element={<MiPerfil />} />
            <Route path="mis-documentos" element={<MisDocumentos />} />
            <Route path="mis-entrevistas" element={<MisEntrevistas />} />
            
            {/* Módulos para JEFE */}
            <Route path="postulantes" element={
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Lista de Postulantes</h2>
                <p>Gestiona los postulantes de tu área</p>
              </div>
            } />
            <Route path="mis-pasantes" element={
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Mis Pasantes</h2>
                <p>Visualiza los pasantes bajo tu cargo</p>
              </div>
            } />
            <Route path="historial-entrevistas" element={
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Historial de Entrevistas</h2>
                <p>Consulta el historial de entrevistas realizadas</p>
              </div>
            } />
            
            {/* Módulos para RRHH */}
            <Route path="gestion-postulantes" element={
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Gestión de Postulantes</h2>
                <p>Administra todos los postulantes del sistema</p>
              </div>
            } />
            <Route path="agenda-entrevistas" element={
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Agenda de Entrevistas</h2>
                <p>Programa y gestiona entrevistas</p>
              </div>
            } />
            <Route path="departamentos" element={
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Departamentos</h2>
                <p>Administra los departamentos de la empresa</p>
              </div>
            } />
            <Route path="induccion" element={
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Inducción</h2>
                <p>Gestiona el proceso de inducción</p>
              </div>
            } />
            <Route path="tutoriales" element={
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Tutoriales</h2>
                <p>Administra los tutoriales para pasantes</p>
              </div>
            } />
            <Route path="reportes" element={
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Reportes</h2>
                <p>Genera reportes estadísticos</p>
              </div>
            } />
          </Route>
          
          {/* ========== RUTA POR DEFECTO ========== */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;