import React, { useEffect, useState } from 'react';
import './Departamentos.css';
import {
  getResumenDepartamentosRRHH,
  getPasantesPorDepartamentoRRHH
} from '../../services/api';

const Departamentos = () => {
  const [departamentos, setDepartamentos] = useState([]);
  const [expandido, setExpandido] = useState(null);
  const [pasantes, setPasantes] = useState([]);

  useEffect(() => {
    cargarDepartamentos();
  }, []);

  const cargarDepartamentos = async () => {
    const res = await getResumenDepartamentosRRHH();
    setDepartamentos(res.data || []);
  };

  const verPasantes = async (dep) => {
    if (expandido === dep.id) {
      setExpandido(null);
      setPasantes([]);
      return;
    }

    const res = await getPasantesPorDepartamentoRRHH(dep.id);
    setExpandido(dep.id);
    setPasantes(res.data || []);
  };

  return (
    <div className="page-content">
      <h2>Departamentos</h2>

      <div className="dep-list">
        {departamentos.map(dep => (
          <div key={dep.id} className="dep-card">
            <div className="dep-header">
              <div>
                <h4>{dep.nombre_area}</h4>
                <p>Jefe: {dep.jefe_departamento || 'No asignado'}</p>
                <p>Pasantes: {dep.total_pasantes}</p>
              </div>

              <button onClick={() => verPasantes(dep)}>
                {expandido === dep.id ? 'Ocultar' : 'Ver pasantes'}
              </button>
            </div>

            {expandido === dep.id && (
              <div className="dep-pasantes">
                {pasantes.length === 0 && (
                  <p>No hay pasantes asignados</p>
                )}

                {pasantes.map(p => (
                  <div key={p.ci} className="dep-pasante">
                    <strong>{p.nombre_completo}</strong>
                    <span>{p.carrera}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Departamentos;
