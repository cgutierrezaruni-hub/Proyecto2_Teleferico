import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';
import './MisDocumentos.css';

const DOCUMENTOS_REQUERIDOS = [
  { key: 'carta_solicitud', label: 'Carta de solicitud de la universidad' },
  { key: 'certificado_notas', label: 'Certificado de notas / Récord académico' },
  { key: 'hoja_vida', label: 'Hoja de vida (no documentada)' },
  { key: 'ci', label: 'Fotocopia de Cédula de Identidad' },
  { key: 'factura_servicio', label: 'Factura de luz, agua o gas' },
  { key: 'croquis_domicilio', label: 'Croquis de domicilio' },
  { key: 'referencias_personales', label: 'Dos referencias personales con CI y croquis' }
];

const MisDocumentos = () => {
  const [documentosSubidos, setDocumentosSubidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [confirmado, setConfirmado] = useState(false);
  const [subiendo, setSubiendo] = useState(null);

  const cargarDocumentos = async () => {
    try {
      const response = await api.get('/documentos');
      const docs = response.documentos || [];
      setDocumentosSubidos(docs);
      const yaConfirmado = docs.some(d => d.tipo === 'ENVIO_CONFIRMADO');
      setConfirmado(yaConfirmado);
    } catch (error) {
      toast.error('Error cargando documentos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDocumentos();
  }, []);

  const handleSubirDocumento = async (tipo, archivo) => {
    if (!archivo) return;
    const formData = new FormData();
    formData.append('tipo', tipo);
    formData.append('archivo', archivo);

    try {
      setSubiendo(tipo);
      await api.post('/documentos/subir', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Documento subido correctamente');
      cargarDocumentos();
    } catch (error) {
      toast.error(error.error || 'Error al subir documento');
    } finally {
      setSubiendo(null);
    }
  };

  // NUEVA FUNCIÓN PARA ELIMINAR
  const handleEliminarDocumento = async (tipo) => {
    const seguro = window.confirm('¿Está seguro de eliminar este documento? Tendrá que volver a subirlo.');
    if (!seguro) return;

    try {
      // Esta es la ruta que crearemos en tu backend
      await api.delete(`/documentos/${tipo}`);
      toast.success('Documento eliminado correctamente');
      cargarDocumentos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al eliminar el documento');
    }
  };

  const confirmarEnvio = async () => {
    if (documentosSubidos.length < DOCUMENTOS_REQUERIDOS.length) {
      toast.error('Debe subir todos los documentos antes de confirmar');
      return;
    }

    // ALERTA DE CONFIRMACIÓN FINAL
    const seguro = window.confirm(
      "¿Está completamente seguro de enviar los documentos?\n\nUna vez confirmados, su expediente será enviado a Recursos Humanos y NO podrá eliminar archivos ni hacer más correcciones."
    );

    if (!seguro) return;

    try {
      await api.post('/documentos/confirmar');
      toast.success('Documentos enviados correctamente');
      cargarDocumentos();
    } catch (error) {
      toast.error('Error al confirmar documentos');
    }
  };

  const documentoYaSubido = (tipo) => documentosSubidos.some(d => d.tipo === tipo);

  if (cargando) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Cargando información...</p>
      </div>
    );
  }

  const progreso = Math.round((documentosSubidos.filter(d => d.tipo !== 'ENVIO_CONFIRMADO').length / DOCUMENTOS_REQUERIDOS.length) * 100);

  return (
    <div className="md-container">
      <div className="md-header">
        <div className="md-header-text">
          <h1>Mis Documentos</h1>
          <p>Por favor, suba todos los documentos requeridos. Una vez confirmados, su expediente será enviado y no podrá modificarlo.</p>
        </div>
        <div className="md-progress-box">
          <span>Progreso: {progreso}%</span>
          <div className="md-progress-bar">
            <div className="md-progress-fill" style={{ width: `${progreso}%` }}></div>
          </div>
        </div>
      </div>

      <div className="md-table-container">
        <div className="md-table-header">
          <div className="md-col-name">DOCUMENTO REQUERIDO</div>
          <div className="md-col-status">ESTADO</div>
          <div className="md-col-action">ACCIÓN</div>
        </div>

        <div className="md-table-body">
          {DOCUMENTOS_REQUERIDOS.map(doc => {
            const isUploaded = documentoYaSubido(doc.key);
            const isUploading = subiendo === doc.key;

            return (
              <div key={doc.key} className={`md-row ${isUploaded ? 'row-success' : ''} ${isUploading ? 'row-uploading' : ''}`}>
                
                <div className="md-col-name">
                  <span className="md-icon">📄</span>
                  <span className="md-doc-name">{doc.label} <span className="md-required"></span></span>
                </div>

                <div className="md-col-status">
                  {isUploaded ? (
                    <span className="md-badge badge-success">Documento Cargado</span>
                  ) : isUploading ? (
                    <span className="md-badge badge-warning">Subiendo...</span>
                  ) : confirmado ? (
                    <span className="md-badge badge-disabled">Bloqueado</span>
                  ) : (
                    <span className="md-badge badge-pending">Pendiente</span>
                  )}
                </div>

                <div className="md-col-action" style={{ display: 'flex', gap: '8px' }}>
                  {isUploaded && !confirmado ? (
                    <>
                      <button className="md-btn btn-success-outline" disabled>
                        Completado
                      </button>
                      <button 
                        className="md-btn btn-danger" 
                        onClick={() => handleEliminarDocumento(doc.key)}
                        title="Eliminar documento"
                      >
                        🗑️
                      </button>
                    </>
                  ) : isUploaded && confirmado ? (
                     <button className="md-btn btn-success-outline" disabled>
                        Completado
                     </button>
                  ) : confirmado ? (
                    <button className="md-btn btn-disabled" disabled>
                      Cerrado
                    </button>
                  ) : (
                    <label className={`md-btn ${isUploading ? 'btn-disabled' : 'btn-upload'}`}>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.png"
                        disabled={isUploading}
                        onChange={e => handleSubirDocumento(doc.key, e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                      {isUploading ? 'Cargando...' : 'Elegir archivo'}
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="md-footer-actions">
        {confirmado && (
          <div className="md-alert md-alert-success">
            <strong>¡Expediente completado!</strong> Sus documentos han sido enviados.
          </div>
        )}
        <button
          className="md-btn-confirm"
          onClick={confirmarEnvio}
          disabled={confirmado || documentosSubidos.length < DOCUMENTOS_REQUERIDOS.length}
        >
          {confirmado ? 'Envío Confirmado' : 'Confirmar Envío de Documentos'}
        </button>
      </div>
    </div>
  );
};

export default MisDocumentos;