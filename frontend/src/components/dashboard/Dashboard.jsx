import React from 'react';
import { useAuth } from '../../context/AuthContext';

import DashboardPostulante from './postulante/DashboardPostulante';
import DashboardRRHH from './rrhh/DashboardRRHH';
import DashboardJefe from './jefe/DashboardJefe';

const Dashboard = () => {
  const { usuario } = useAuth();

  if (!usuario) return null;

  switch (usuario.rol) {
    case 'postulante':
      return <DashboardPostulante />;

    case 'rrhh':
      return <DashboardRRHH />;

    case 'jefe':
      return <DashboardJefe />;

    default:
      return (
        <div className="page-content">
          <h2>Rol no reconocido</h2>
        </div>
      );
  }
};

export default Dashboard;
