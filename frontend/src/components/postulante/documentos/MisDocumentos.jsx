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

  const confirmarEnvio = async () => {
    if (documentosSubidos.length < DOCUMENTOS_REQUERIDOS.length) {
      toast.error('Debe subir todos los documentos antes de confirmar');
      return;
    }

    try {
      await api.post('/documentos/confirmar');
      toast.success('Documentos enviados correctamente');
      cargarDocumentos();
    } catch (error) {
      toast.error('Error al confirmar documentos');
    }
  };

  const documentoYaSubido = (tipo) =>
    documentosSubidos.some(d => d.tipo === tipo);

  if (cargando) {
    return <p>Cargando documentos...</p>;
  }

  return (
    <div className="container">
      <h1>Mis Documentos</h1>
      <p className="subtitle">
        Suba todos los documentos requeridos. Una vez confirmados, no podrá modificarlos.
      </p>

      <div className="form-section">
        {DOCUMENTOS_REQUERIDOS.map(doc => (
          <div key={doc.key} className="form-group">
            <label>{doc.label}</label>

            {documentoYaSubido(doc.key) ? (
              <span style={{ color: 'green', fontWeight: 600 }}>
                Documento cargado
              </span>
            ) : confirmado ? (
              <span style={{ color: 'gray' }}>
                Envío confirmado
              </span>
            ) : (
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                disabled={subiendo === doc.key}
                onChange={e => handleSubirDocumento(doc.key, e.target.files[0])}
              />
            )}
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button
          className="btn-primary"
          onClick={confirmarEnvio}
          disabled={confirmado}
        >
          Confirmar envío de documentos
        </button>
      </div>

      {confirmado && (
        <div className="alert success" style={{ marginTop: '20px' }}>
          Documentos enviados y bloqueados para edición.
        </div>
      )}
    </div>
  );
};

export default MisDocumentos;
