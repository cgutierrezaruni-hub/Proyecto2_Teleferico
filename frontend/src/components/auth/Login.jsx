import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import './Auth.css';
import fondo from '../../assets/nublado.jpg';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setCargando(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        toast.success('Inicio de sesión exitoso');
        setTimeout(() => navigate('/dashboard'), 500);
      } else {
        toast.error(result.error || 'Error en el login');
      }
    } catch (error) {
      console.error('Error detallado:', error);
      toast.error(error.message || 'Error inesperado');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      {/* COLUMNA IZQUIERDA */}
      <div className="left-column">
        <div className="login-card">
          <h1 className="login-title">Iniciar Sesión</h1>
          <p className="login-subtitle">
            Sistema de Gestión de Pasantías - Mi Teleférico
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                className="input-field"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
                disabled={cargando}
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Contraseña</label>
              <input
                type="password"
                name="password"
                className="input-field"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={cargando}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <span className="spinner-small"></span> INICIANDO SESIÓN...
                </>
              ) : 'INICIAR SESIÓN'}
            </button>
          </form>

          <div className="auth-links">
            <p>
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="auth-link">
                Regístrate como postulante
              </Link>
            </p>
            <p>
              <Link to="/forgot-password" className="auth-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA */}
      <div className="right-column">
        <img src={fondo} alt="Fondo" className="background-image" />
        <div className="image-text">
          <h2 className="image-title">MIS PASANTÍAS</h2>
          <p className="image-subtitle">Mi Teleférico</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
