// frontend/src/components/common/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';

const PrivateRoute = () => {
  const { usuario, cargando } = useAuth();

  // Mostrar loading mientras se verifica autenticación
  if (cargando) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p style={{ color: '#fff', marginTop: '10px' }}>Cargando...</p>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!usuario) {
    return <Navigate to="/login" />;
  }

  // Si está autenticado, mostrar el Layout con las rutas hijas
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default PrivateRoute;