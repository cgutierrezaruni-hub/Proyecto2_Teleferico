import React, { useState } from 'react';
import api from '../../services/api';
import './AsignarPasanteModal.css';

const FinalizarPasanteModal = ({ pasante, tipo, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirmar = async () => {
    setLoading(true);

    try {
      await api.put('/rrhh/pasantes/estado', {
        usuario_ci: pasante.usuario_ci,
        estado: tipo
      });

      onSuccess();
      onClose();
    } catch (error) {
      alert(error.response?.data?.error || 'Error actualizando estado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>
          {tipo === 'FINALIZADO'
            ? 'Finalizar Pasantía'
            : 'Retirar Pasante'}
        </h3>

        <p>
          ¿Estás seguro que deseas
          {tipo === 'FINALIZADO'
            ? ' finalizar '
            : ' retirar '}
          al pasante:
        </p>

        <p><strong>{pasante.nombre_pasante}</strong></p>

        <div className="modal-actions">
          <button
            onClick={handleConfirmar}
            disabled={loading}
            className="btn-primario-sm"
          >
            {loading ? 'Procesando...' : 'Confirmar'}
          </button>

          <button
            onClick={onClose}
            className="btn-secundario-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalizarPasanteModal;
