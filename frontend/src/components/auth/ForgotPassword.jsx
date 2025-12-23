import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import './Auth.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, verifyRecovery, resetPassword } = useAuth();
  
  const [step, setStep] = useState(1); // 1: email, 2: código, 3: nueva contraseña
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setCargando(true);
    
    const result = await forgotPassword(email);
    
    if (result.success) {
      toast.success(result.message || 'Código enviado');
      if (result.codigo) {
        console.log('🔑 Código (modo desarrollo):', result.codigo);
      }
      setStep(2);
    } else {
      toast.error(result.error || 'Error al enviar código');
    }
    
    setCargando(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setCargando(true);
    
    const result = await verifyRecovery(email, codigo);
    
    if (result.success) {
      toast.success('Código verificado');
      setResetToken(result.resetToken);
      setStep(3);
    } else {
      toast.error(result.error || 'Código incorrecto');
    }
    
    setCargando(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (nuevaPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    if (nuevaPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setCargando(true);
    
    const result = await resetPassword(resetToken, nuevaPassword);
    
    if (result.success) {
      toast.success('Contraseña actualizada exitosamente');
      navigate('/login');
    } else {
      toast.error(result.error || 'Error al actualizar contraseña');
    }
    
    setCargando(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Recuperar Contraseña</h2>
        
        {step === 1 && (
          <>
            <form onSubmit={handleRequestCode}>
              <div className="form-group">
                <label>Email registrado</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  required
                  disabled={cargando}
                />
              </div>
              
              <button 
                type="submit" 
                className="auth-button"
                disabled={cargando}
              >
                {cargando ? 'Enviando...' : 'Enviar Código'}
              </button>
              
              <div className="auth-links">
                <Link to="/login">← Volver al login</Link>
              </div>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <form onSubmit={handleVerifyCode}>
              <div className="form-group">
                <label>Código de verificación</label>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  Ingresa el código enviado a <strong>{email}</strong>
                </p>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength="6"
                  required
                  disabled={cargando}
                  style={{ 
                    textAlign: 'center',
                    fontSize: '24px',
                    letterSpacing: '8px',
                    fontWeight: 'bold'
                  }}
                />
              </div>
              
              <button 
                type="submit" 
                className="auth-button"
                disabled={cargando}
              >
                {cargando ? 'Verificando...' : 'Verificar Código'}
              </button>
              
              <button
                type="button"
                className="auth-button secondary"
                onClick={() => setStep(1)}
                disabled={cargando}
                style={{ marginTop: '10px', background: '#6c757d' }}
              >
                Cambiar email
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>Nueva Contraseña</label>
                <input
                  type="password"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength="6"
                  required
                  disabled={cargando}
                />
              </div>
              
              <div className="form-group">
                <label>Confirmar Contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  minLength="6"
                  required
                  disabled={cargando}
                />
              </div>
              
              <button 
                type="submit" 
                className="auth-button"
                disabled={cargando}
              >
                {cargando ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;