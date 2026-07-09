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
    horario: '',
    talla_chamarra: '', // Nuevo
    numero_credencial: '' 
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
          <select 
            value={form.horario} 
            onChange={e => setForm({ ...form, horario: e.target.value })}
          >
            <option value="">Seleccione Horario</option>
            <option value="MAÑANA">MAÑANA</option>
            <option value="TARDE">TARDE</option>
            <option value="COMPLETO">COMPLETO</option>
          </select>
        </div>

        <div className="modal-form-group">
          <label>Modalidad</label>
          <select 
            value={form.modalidad} 
            onChange={e => setForm({ ...form, modalidad: e.target.value })}
          >
            <option value="">Seleccione Modalidad</option>
            <option value="TRABAJO DIRIGIDO">PASANTIA</option>
            <option value="PROYECTO DE GRADO">PROYECTO DE GRADO</option>
            <option value="TRABAJO DIRIGIDO">TRABAJO DIRIGIDO</option>
            <option value="TRABAJO DIRIGIDO">TESIS</option>
          </select>
        </div>

        {/* --- TALLA CHAMARRA --- */}
        <div className="modal-form-group">
          <label>Talla de Chamarra</label>
          <input
            type="text"
            placeholder="Ej. M, L, XL"
            value={form.talla_chamarra}
            onChange={e => setForm({ ...form, talla_chamarra: e.target.value })}
          />
        </div>

        {/* --- NÚMERO DE CREDENCIAL --- */}
        <div className="modal-form-group">
          <label>Número de Credencial</label>
          <input
            type="text"
            placeholder="Ingrese número de credencial"
            value={form.numero_credencial}
            onChange={e => setForm({ ...form, numero_credencial: e.target.value })}
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
