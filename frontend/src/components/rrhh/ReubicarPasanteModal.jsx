import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './AsignarPasanteModal.css';

const ReubicarPasanteModal = ({ pasante, onClose, onSuccess }) => {
  const [departamentos, setDepartamentos] = useState([]);
  const [jefes, setJefes] = useState([]);
  const [departamentoId, setDepartamentoId] = useState('');
  const [jefeCi, setJefeCi] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/rrhh/departamentos').then(res => {
      setDepartamentos(res.data);
    });
  }, []);

  useEffect(() => {
    if (departamentoId) {
      api.get(`/rrhh/jefes/${departamentoId}`).then(res => {
        setJefes(res.data);
      });
    }
  }, [departamentoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/rrhh/pasantes/reubicar', {
        usuario_ci: pasante.usuario_ci,
        departamento_id: departamentoId,
        jefe_ci: jefeCi
      });

      onSuccess();
      onClose();
    } catch (error) {
      alert(error.response?.data?.error || 'Error reubicando pasante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Reubicar Pasante</h3>

        <p><strong>{pasante.nombre_pasante}</strong></p>

        <form onSubmit={handleSubmit}>
          <select
            value={departamentoId}
            onChange={e => setDepartamentoId(e.target.value)}
            required
          >
            <option value="">Seleccione departamento</option>
            {departamentos.map(dep => (
              <option key={dep.id} value={dep.id}>
                {dep.nombre_area}
              </option>
            ))}
          </select>

          <select
            value={jefeCi}
            onChange={e => setJefeCi(e.target.value)}
            required
            disabled={!departamentoId}
          >
            <option value="">Seleccione jefe</option>
            {jefes.map(j => (
              <option key={j.usuario_ci} value={j.usuario_ci}>
                {j.nombre_completo}
              </option>
            ))}
          </select>

          <div className="modal-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Reubicando...' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReubicarPasanteModal;
