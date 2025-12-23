import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import './Auth.css';

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
    setCargando(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        toast.success('¡Login exitoso!');
        
        // Pequeña pausa antes de redirigir
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        toast.error(result.error || 'Error en el login');
      }
    } catch (error) {
      toast.error('Error inesperado');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Mi Teleférico</h2>
          <p className="auth-subtitle">Sistema de Pasantías</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
              disabled={cargando}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
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
            className="auth-button"
            disabled={cargando}
          >
            {cargando ? (
              <>
                <span className="spinner"></span> Conectando...
              </>
            ) : 'Iniciar Sesión'}
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

        <div className="auth-test-credentials">
          <p><strong>Credenciales de prueba:</strong></p>
          <div className="credentials-list">
            <div className="credential-item">
              <strong>Postulante:</strong> postulante@test.com / 123456
            </div>
            <div className="credential-item">
              <strong>Jefe:</strong> jefe@test.com / 123456
            </div>
            <div className="credential-item">
              <strong>RRHH:</strong> rrhh@test.com / 123456
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;