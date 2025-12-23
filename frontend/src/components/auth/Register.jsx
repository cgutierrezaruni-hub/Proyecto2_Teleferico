import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import './Auth.css';

// Lista de departamentos FUERA del componente (para evitar recreación)
const DEPARTAMENTOS_BOLIVIA = [
  { value: 'LP', label: 'LP - La Paz' },
  { value: 'CB', label: 'CB - Cochabamba' },
  { value: 'SC', label: 'SC - Santa Cruz' },
  { value: 'OR', label: 'OR - Oruro' },
  { value: 'PT', label: 'PT - Potosí' },
  { value: 'TJ', label: 'TJ - Tarija' },
  { value: 'CH', label: 'CH - Chuquisaca' },
  { value: 'BE', label: 'BE - Beni' },
  { value: 'PD', label: 'PD - Pando' },
  { value: 'OT', label: 'OT - Otro/Extranjero' }
];

const Register = () => {
  const [formData, setFormData] = useState({
    ci: '',
    extension_ci: '', // Cambié de 'LP' a vacío
    email: '',
    password: '',
    confirmPassword: '',
    nombre_completo: ''
  });
  const [cargando, setCargando] = useState(false);
  const { registro } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones mejoradas
    if (!formData.ci || formData.ci.length < 5) {
      toast.error('El CI debe tener al menos 5 dígitos');
      return;
    }
    
    if (!formData.extension_ci) {
      toast.error('Debe seleccionar una extensión');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCargando(true);

    const datosEnvio = {
      ci: parseInt(formData.ci),
      extension_ci: formData.extension_ci,
      email: formData.email,
      password: formData.password,
      nombre_completo: formData.nombre_completo
    };

    const result = await registro(datosEnvio);

    if (result.success) {
      toast.success('¡Registro exitoso! Ahora puedes iniciar sesión');
      navigate('/login');
    } else {
      toast.error(result.error);
    }

    setCargando(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Sistema de Pasantías</h2>
        <h3 className="auth-subtitle">Registro de Postulante</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Carnet de Identidad *</label>
              <input
                type="number"
                name="ci"
                value={formData.ci}
                onChange={handleChange}
                placeholder="Ej: 12345678"
                required
                disabled={cargando}
                min="10000"
                max="999999999"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label>Extensión CI *</label>
              <select
                name="extension_ci"
                value={formData.extension_ci}
                onChange={handleChange}
                disabled={cargando}
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                id="bolivia-departamento"
              >
                <option value="" disabled>
                  -- Seleccione departamento --
                </option>
                {DEPARTAMENTOS_BOLIVIA.map((dep) => (
                  <option 
                    key={dep.value} 
                    value={dep.value}
                  >
                    {dep.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Nombre Completo *</label>
            <input
              type="text"
              name="nombre_completo"
              value={formData.nombre_completo}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez García"
              required
              disabled={cargando}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ej: juan.perez@email.com"
              required
              disabled={cargando}
              autoComplete="email"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contraseña *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                required
                disabled={cargando}
                minLength="6"
                autoComplete="new-password"
              />
              <small className="form-help">Mínimo 6 caracteres</small>
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                required
                disabled={cargando}
                minLength="6"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="form-notice">
            <small>* Campos obligatorios</small>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={cargando}
          >
            {cargando ? 'Registrando...' : 'Registrarse como Postulante'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="auth-link">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;