import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './DashboardJefe.css';

const DashboardJefe = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Bienvenido, {usuario?.nombre}</h1>
        <p className="subtitle">Panel de Jefe de Departamento</p>
      </div>

      <div className="dashboard-cards">

        <div className="card">
          <h3>Postulantes</h3>
          <p>Revisa postulantes de tu área</p>
          <button
            className="card-button"
            onClick={() => navigate('/postulantes')}
          >
            Ver Postulantes
          </button>
        </div>

        <div className="card">
          <h3>Mis Pasantes</h3>
          <p>Pasantes asignados a tu departamento</p>
          <button
            className="card-button"
            onClick={() => navigate('/mis-pasantes')}
          >
            Ver Pasantes
          </button>
        </div>

        <div className="card">
          <h3>Entrevistas</h3>
          <p>Historial de entrevistas realizadas</p>
          <button
            className="card-button"
            onClick={() => navigate('/historial-entrevistas')}
          >
            Ver Entrevistas
          </button>
        </div>

      </div>
    </div>
  );
};

export default DashboardJefe;
