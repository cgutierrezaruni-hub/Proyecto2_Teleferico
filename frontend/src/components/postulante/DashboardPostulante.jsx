import React from 'react';
import { useAuth } from '../../context/AuthContext';

const DashboardPostulante = () => {
  const { usuario } = useAuth();

  return (
    <div className="dashboard">
      <h1>Bienvenido, {usuario?.nombre}</h1>
      <p className="subtitle">Panel de Postulante</p>
      
      <div className="dashboard-cards">
        <div className="card">
          <h3>Mi Perfil</h3>
          <p>Completa y actualiza tu información personal</p>
          <button className="card-button">Ver Perfil</button>
        </div>
        
        <div className="card">
          <h3>Mis Documentos</h3>
          <p>Sube y gestiona tus documentos requeridos</p>
          <button className="card-button">Ver Documentos</button>
        </div>
        
        <div className="card">
          <h3>Mis Entrevistas</h3>
          <p>Revisa tus entrevistas programadas</p>
          <button className="card-button">Ver Entrevistas</button>
        </div>
        
        <div className="card">
          <h3>Estado</h3>
          <p>Consulta el estado de tu postulación</p>
          <div className="status-badge pendiente">PENDIENTE</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPostulante;