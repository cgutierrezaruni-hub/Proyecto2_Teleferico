import React, { useEffect, useState, useCallback } from 'react';
import './GestionPostulantes.css';
import {
  getPostulantesRRHH,
  getPasantesRRHH
} from '../../services/api';
import AsignarPasanteModal from './AsignarPasanteModal';
import VerDocumentosModal from './VerDocumentosModal';

const GestionPostulantes = () => {
  const [vista, setVista] = useState('postulantes');
  const [lista, setLista] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [verDocumentos, setVerDocumentos] = useState(null);

  const cargar = useCallback(async () => {
    const res = vista === 'postulantes'
      ? await getPostulantesRRHH()
      : await getPasantesRRHH();
    setLista(res.data);
  }, [vista]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <div className="page-content">
      <h2>Gestión de Postulantes</h2>

      <div className="rrhh-filtros">
        <button
          className={vista === 'postulantes' ? 'activo' : ''}
          onClick={() => setVista('postulantes')}
        >
          Postulantes
        </button>

        <button
          className={vista === 'pasantes' ? 'activo' : ''}
          onClick={() => setVista('pasantes')}
        >
          Pasantes
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Carrera</th>
            <th>Universidad</th>

            {vista === 'pasantes' && (
              <>
                <th>Área</th>
                <th>Jefe Asignado</th>
              </>
            )}

            {vista === 'postulantes' && <th>Acción</th>}
          </tr>
        </thead>

        <tbody>
          {lista.map(p => (
            <tr key={p.usuario_ci}>
              <td>
                {vista === 'pasantes'
                  ? p.nombre_pasante
                  : p.nombre_completo}
              </td>

              <td>{p.carrera}</td>
              <td>{p.universidad}</td>

              {vista === 'pasantes' && (
                <>
                  <td>{p.area}</td>
                  <td>{p.nombre_jefe}</td>
                </>
              )}

              {vista === 'postulantes' && (
                <td>
                  <div className="acciones-rrhh">
                    <button
                      className="btn-primario-sm"
                      onClick={() => setSeleccionado(p)}
                      type="button"
                    >
                      Asignar
                    </button>

                    <button
                      className="btn-secundario-sm"
                      onClick={() => setVerDocumentos(p)}
                      type="button"
                    >
                      Documentos
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {seleccionado && (
        <AsignarPasanteModal
          postulante={seleccionado}
          onClose={() => {
            setSeleccionado(null);
            cargar();
          }}
        />
      )}

      {verDocumentos && (
        <VerDocumentosModal
          postulante={verDocumentos}
          onClose={() => setVerDocumentos(null)}
        />
      )}
    </div>
  );
};

export default GestionPostulantes;
