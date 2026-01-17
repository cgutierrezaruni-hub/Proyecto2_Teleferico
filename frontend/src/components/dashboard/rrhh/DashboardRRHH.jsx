import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './DashboardRRHH.css';

const DashboardRRHH = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Bienvenido, {usuario?.nombre}</h1>
        <p className="subtitle">Panel de Recursos Humanos</p>
      </div>

      <div className="dashboard-cards">

        <div className="card">
          <h3>Postulantes</h3>
          <p>Gestiona postulantes y pasantes del sistema</p>
          <button
            className="card-button"
            onClick={() => navigate('/gestion-postulantes')}
          >
            Ver Postulantes
          </button>
        </div>

        <div className="card">
          <h3>Entrevistas</h3>
          <p>Agenda y administra entrevistas</p>
          <button
            className="card-button"
            onClick={() => navigate('/agenda-entrevistas')}
          >
            Ver Entrevistas
          </button>
        </div>

        <div className="card">
          <h3>Departamentos</h3>
          <p>Gestiona departamentos y jefes</p>
          <button
            className="card-button"
            onClick={() => navigate('/departamentos')}
          >
            Ver Departamentos
          </button>
        </div>

        <div className="card">
          <h3>Inducción</h3>
          <p>Documentos de inducción para pasantes</p>
          <button
            className="card-button"
            onClick={() => navigate('/induccion')}
          >
            Ir a Inducción
          </button>
        </div>

        <div className="card">
          <h3>Tutoriales</h3>
          <p>Gestiona tutoriales para pasantes activos</p>
          <button
            className="card-button"
            onClick={() => navigate('/tutoriales')}
          >
            Ver Tutoriales
          </button>
        </div>

        <div className="card">
          <h3>Reportes</h3>
          <p>Reportes y estadísticas del sistema</p>
          <button
            className="card-button"
            onClick={() => navigate('/reportes')}
          >
            Ver Reportes
          </button>
        </div>

      </div>
    </div>
  );
};

export default DashboardRRHH;
