import React, { useEffect, useState } from 'react';
import './AsignarPasanteModal.css';
import {
  getDepartamentosRRHH,
  getJefesPorDepartamentoRRHH,
  asignarPasanteRRHH
} from '../../services/api';

const AsignarPasanteModal = ({ postulante, onClose }) => {
  const [departamentos, setDepartamentos] = useState([]);
  const [jefes, setJefes] = useState([]);
  const [form, setForm] = useState({
    departamento_id: '',
    jefe_ci: '',
    fecha_inicio: '',
    fecha_fin: '',
    modalidad: '',
    horario: ''
  });

  useEffect(() => {
    getDepartamentosRRHH().then(res => setDepartamentos(res.data));
  }, []);

  useEffect(() => {
    if (form.departamento_id) {
      getJefesPorDepartamentoRRHH(form.departamento_id)
        .then(res => setJefes(res.data));
    }
  }, [form.departamento_id]);

  const submit = async () => {
    if (
      !form.departamento_id ||
      !form.jefe_ci ||
      !form.fecha_inicio ||
      !form.fecha_fin
    ) {
      alert('Debe completar todos los campos obligatorios');
      return;
    }

    await asignarPasanteRRHH({
      ...form,
      usuario_ci: postulante.usuario_ci
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h3 className="modal-title">Asignar Pasante</h3>

        <div className="modal-form-group">
          <label>Departamento</label>
          <select
            value={form.departamento_id}
            onChange={e =>
              setForm({ ...form, departamento_id: e.target.value })
            }
          >
            <option value="">Seleccione un departamento</option>
            {departamentos.map(d => (
              <option key={d.id} value={d.id}>
                {d.nombre_area}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-form-group">
          <label>Jefe Responsable</label>
          <select
            value={form.jefe_ci}
            onChange={e =>
              setForm({ ...form, jefe_ci: e.target.value })
            }
          >
            <option value="">Seleccione un jefe</option>
            {jefes.map(j => (
              <option key={j.usuario_ci} value={j.usuario_ci}>
                {j.nombre_completo}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-form-group">
          <label>Fecha de Inicio</label>
          <input
            type="date"
            value={form.fecha_inicio}
            onChange={e =>
              setForm({ ...form, fecha_inicio: e.target.value })
            }
          />
        </div>

        <div className="modal-form-group">
          <label>Fecha de Finalización</label>
          <input
            type="date"
            value={form.fecha_fin}
            onChange={e =>
              setForm({ ...form, fecha_fin: e.target.value })
            }
          />
        </div>

        <div className="modal-form-group">
          <label>Horario</label>
          <input
            type="text"
            placeholder="Ej. Mañana"
            value={form.horario}
            onChange={e =>
              setForm({ ...form, horario: e.target.value })
            }
          />
        </div>

        <div className="modal-form-group">
          <label>Modalidad</label>
          <input
            type="text"
            placeholder="Ej. Proyecto de grado"
            value={form.modalidad}
            onChange={e =>
              setForm({ ...form, modalidad: e.target.value })
            }
          />
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={submit}>
            Confirmar Asignación
          </button>
        </div>
      </div>
    </div>
  );
};

export default AsignarPasanteModal;
