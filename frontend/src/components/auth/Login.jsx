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
  const [mostrarCredenciales, setMostrarCredenciales] = useState(false);
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
        toast.success('¡Login exitoso!');
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

  // Credenciales de prueba para desarrollo
  const credencialesPrueba = [
    { rol: 'Postulante', email: 'user@example.com', password: 'UserPass123', hash: '$2a$10$N9qo8uLOickgx2ZMRZoMye' },
    { rol: 'Jefe de Área', email: 'jefe@example.com', password: 'JefePass123', hash: '$2a$10$UZ4mR7WkLJvFfE9pYq8sN.' },
    { rol: 'RRHH', email: 'rrhh1@example.com', password: 'RrhhPass123', hash: '$2a$10$H5gF8tR2wV3bN6mK7jL0pQ' }
  ];

  const usarCredencial = (email, password) => {
    setFormData({ email, password });
    toast.success(`Credencial de ${email} cargada`);
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

          {/* BOTÓN PARA MOSTRAR CREDENCIALES */}
          <button 
            className="toggle-credenciales-btn"
            onClick={() => setMostrarCredenciales(!mostrarCredenciales)}
            type="button"
          >
            {mostrarCredenciales ? '▲ Ocultar credenciales' : '▼ Mostrar credenciales de prueba'}
          </button>

          {/* SECCIÓN DE CREDENCIALES (colapsable) */}
          {mostrarCredenciales && (
            <div className="credenciales-container">
              <h4 className="credenciales-title">Credenciales para Desarrollo</h4>
              <p className="credenciales-desc">
                Estas son credenciales de ejemplo para pruebas. 
                Las contraseñas están hasheadas con bcrypt en producción.
              </p>
              
              {credencialesPrueba.map((credencial, index) => (
                <div key={index} className="credencial-item">
                  <div className="credencial-info">
                    <strong>{credencial.rol}:</strong>
                    <div className="credencial-email">{credencial.email}</div>
                    <div className="credencial-password">
                      <span>Contraseña: </span>
                      <code>{credencial.password}</code>
                    </div>
                    <div className="credencial-hash">
                      <small>Hash: {credencial.hash}...</small>
                    </div>
                  </div>
                  <button
                    className="usar-credencial-btn"
                    onClick={() => usarCredencial(credencial.email, credencial.password)}
                    type="button"
                    disabled={cargando}
                  >
                    Usar
                  </button>
                </div>
              ))}
              
              <div className="credenciales-nota">
                <small>
                  <strong>Nota:</strong> En producción, las contraseñas se almacenan como hashes.
                  Los hashes mostrados son ejemplos del formato bcrypt.
                </small>
              </div>
            </div>
          )}

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