import React, { useEffect, useState } from 'react';
import './VerDocumentosModal.css';
import {
  getDocumentosPostulanteRRHH,
  descargarDocumentoPostulanteRRHH
} from '../../services/api';

const VerDocumentosModal = ({ postulante, onClose }) => {
  const [cargando, setCargando] = useState(true);
  const [documentos, setDocumentos] = useState([]);
  const [error, setError] = useState('');

  const cargar = async () => {
    try {
      setCargando(true);
      setError('');
      const res = await getDocumentosPostulanteRRHH(postulante.usuario_ci);
      setDocumentos(res.documentos || []);
    } catch (e) {
      setError(e?.error || 'No se pudo cargar documentos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postulante?.usuario_ci]);

  // ===== VER DOCUMENTO (PDF, imagen, etc.) =====
  const verDocumento = async (tipo) => {
    try {
      const blob = await descargarDocumentoPostulanteRRHH(
        postulante.usuario_ci,
        tipo
      );

      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      alert(e?.error || 'No se pudo abrir el documento');
    }
  };

  // ===== DESCARGAR DOCUMENTO =====
  const descargarDocumento = async (tipo) => {
    try {
      const blob = await descargarDocumentoPostulanteRRHH(
        postulante.usuario_ci,
        tipo
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${postulante.usuario_ci}_${tipo}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(e?.error || 'No se pudo descargar el documento');
    }
  };

  return (
    <div className="vdm-overlay" onClick={onClose}>
      <div className="vdm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="vdm-header">
          <div>
            <h3>Documentos del postulante</h3>
            <p className="vdm-subtitle">
              {postulante.nombre_completo} — CI {postulante.usuario_ci}
            </p>
          </div>

          <button className="vdm-close" onClick={onClose} type="button">
            Cerrar
          </button>
        </div>

        <div className="vdm-body">
          {cargando && (
            <div className="vdm-info">Cargando documentos...</div>
          )}

          {!cargando && error && (
            <div className="vdm-error">{error}</div>
          )}

          {!cargando && !error && documentos.length === 0 && (
            <div className="vdm-info">
              No se encontraron documentos registrados.
            </div>
          )}

          {!cargando && !error && documentos.length > 0 && (
            <table className="vdm-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Fecha subida</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documentos.map((d) => (
                  <tr key={d.id || `${d.tipo}-${d.fecha_subida}`}>
                    <td className="vdm-tipo">{d.tipo}</td>
                    <td>
                      {d.fecha_subida
                        ? new Date(d.fecha_subida).toLocaleString()
                        : '-'}
                    </td>
                    <td className="vdm-actions">
                      <button
                        className="vdm-btn"
                        onClick={() => verDocumento(d.tipo)}
                        type="button"
                      >
                        Ver
                      </button>
                      <button
                        className="vdm-btn vdm-btn-sec"
                        onClick={() => descargarDocumento(d.tipo)}
                        type="button"
                      >
                        Descargar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="vdm-footer">
          <button
            className="vdm-btn vdm-btn-sec"
            onClick={cargar}
            type="button"
          >
            Recargar
          </button>
          <button className="vdm-btn" onClick={onClose} type="button">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerDocumentosModal;
