import React, { useEffect, useState, useCallback } from 'react';
import './GestionPostulantes.css';
import { getPostulantesRRHH, getPasantesRRHH } from '../../services/api';
import api from '../../services/api';

import AsignarPasanteModal from './AsignarPasanteModal';
import VerDocumentosModal from './VerDocumentosModal';
import ReubicarPasanteModal from './ReubicarPasanteModal';
import FinalizarPasanteModal from './FinalizarPasanteModal';

const GestionPostulantes = () => {
  const [vista, setVista] = useState('postulantes');
  const [lista, setLista] = useState([]);

  const [seleccionado, setSeleccionado] = useState(null);
  const [verDocumentos, setVerDocumentos] = useState(null);
  const [pasanteReubicar, setPasanteReubicar] = useState(null);
  const [pasanteEstado, setPasanteEstado] = useState(null);
  const [tipoEstado, setTipoEstado] = useState(null);
  const [filtro, setFiltro] = useState('');

  // =========================
  // CARGA DE DATOS SEGÚN VISTA
  // =========================
  const cargar = useCallback(async () => {
    let res;

    if (vista === 'postulantes') {
      res = await getPostulantesRRHH();
      setLista(res.data);
      return;
    }

    if (vista === 'pasantes') {
      res = await getPasantesRRHH();
      setLista(res.data);
      return;
    }

    // HISTÓRICO (finalizados / retirados)
    const historico = await api.get('/rrhh/pasantes/historico');
    setLista(historico.data);

  }, [vista]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Lógica para filtrar la lista en tiempo real
  const listaFiltrada = lista.filter(p => {
    const textoBusqueda = filtro.toLowerCase();
    const nombre = (p.nombre_pasante || p.nombre_completo || '').toLowerCase();
    const carrera = (p.carrera || '').toLowerCase();
    const universidad = (p.universidad || '').toLowerCase();
    const area = (p.area || '').toLowerCase();
    const semestre = (p.semestre || p.anio_cursando || '').toLowerCase();

    // BUG CORREGIDO AQUÍ: Se añadió el || antes de semestre
    return nombre.includes(textoBusqueda) || 
           carrera.includes(textoBusqueda) || 
           universidad.includes(textoBusqueda) ||
           area.includes(textoBusqueda) ||
           semestre.includes(textoBusqueda);
  });

  return (
    <div className="page-content">
      <h2>Gestión de Postulantes</h2>

      {/* ===== PESTAÑAS ===== */}
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

        <button
          className={vista === 'historico' ? 'activo' : ''}
          onClick={() => setVista('historico')}
        >
          Finalizados / Retirados
        </button>

        <div className="buscador-compacto">
          <span className="lupa-minimal">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          {filtro && (
            <button className="clear-btn" onClick={() => setFiltro('')}>×</button>
          )}
        </div>
      </div>

      {/* ===== TABLA ===== */}
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Carrera</th>
            <th>Semestre</th>
            <th>Universidad</th>

            {vista === 'pasantes' && (
              <>
                <th>Área</th>
                <th>Jefe Asignado</th>
                <th>Acción</th>
              </>
            )}

            {vista === 'postulantes' && <th>Acción</th>}

            {vista === 'historico' && (
              <>
                <th>Área</th>
                <th>Estado</th>
                <th>Fecha Fin</th>
              </>
            )}
          </tr>
        </thead>

        <tbody>
          {listaFiltrada.map(p => (
            <tr key={p.usuario_ci}>
              <td>
                {vista === 'pasantes' || vista === 'historico'
                  ? p.nombre_pasante || p.nombre_completo
                  : p.nombre_completo}
              </td>

              <td>{p.carrera}</td>
              <td>
                <span className="badge-semestre">
                  {p.semestre || p.anio_cursando || 'N/A'}
                </span>
              </td>
              <td>{p.universidad}</td>

              {/* ===== PASANTES ACTIVOS ===== */}
              {vista === 'pasantes' && (
                <>
                  <td>{p.area}</td>
                  <td>{p.nombre_jefe}</td>
                  <td>
                    <div className="acciones-rrhh">
                      <button
                        className="btn-secundario-sm"
                        onClick={() => setPasanteReubicar(p)}
                      >
                        Reubicar
                      </button>

                      <button
                        className="btn-primario-sm"
                        onClick={() => {
                          setPasanteEstado(p);
                          setTipoEstado('FINALIZADO');
                        }}
                      >
                        Finalizar
                      </button>

                      <button
                        className="btn-secundario-sm"
                        onClick={() => {
                          setPasanteEstado(p);
                          setTipoEstado('RETIRADO');
                        }}
                      >
                        Retirar
                      </button>
                      <button
                        className="btn-secundario-sm"
                        onClick={() => setVerDocumentos(p)}
                      >
                        Documentos
                      </button>
                    </div>
                  </td>
                </>
              )}

              {/* ===== POSTULANTES ===== */}
              {vista === 'postulantes' && (
                <td>
                  <div className="acciones-rrhh">
                    <button
                      className="btn-primario-sm"
                      onClick={() => setSeleccionado(p)}
                    >
                      Asignar
                    </button>

                    <button
                      className="btn-secundario-sm"
                      onClick={() => setVerDocumentos(p)}
                    >
                      Documentos
                    </button>
                  </div>
                </td>
              )}

              {/* ===== HISTÓRICO ===== */}
              {vista === 'historico' && (
                <>
                  <td>{p.area}</td>
                  <td>
                    <strong>{p.estado_postulacion}</strong>
                  </td>
                  <td>{p.fecha_fin}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== MODALES ===== */}
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

      {pasanteReubicar && (
        <ReubicarPasanteModal
          pasante={pasanteReubicar}
          onClose={() => setPasanteReubicar(null)}
          onSuccess={cargar}
        />
      )}

      {pasanteEstado && (
        <FinalizarPasanteModal
          pasante={pasanteEstado}
          tipo={tipoEstado}
          onClose={() => {
            setPasanteEstado(null);
            setTipoEstado(null);
          }}
          onSuccess={cargar}
        />
      )}
    </div>
  );
};

export default GestionPostulantes;