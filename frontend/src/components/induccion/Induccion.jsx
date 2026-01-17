import React, { useEffect, useState } from 'react';
import {
  getInduccionRRHH,
  getInduccionPasante,
  subirInduccion,
  descargarInduccion
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Induccion.css';

const Induccion = () => {
  const { usuario } = useAuth();

  const [docs, setDocs] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);

  // ======================
  // CARGAR DOCUMENTOS
  // ======================
  const cargar = async () => {
    try {
      let res;

      if (usuario?.rol === 'rrhh') {
        res = await getInduccionRRHH();
      } else {
        res = await getInduccionPasante();
      }

      setDocs(res.data || []);
    } catch (e) {
      console.error('Error cargando inducción:', e);
      setDocs([]);
    }
  };

  useEffect(() => {
    if (usuario) {
      cargar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!archivo) {
      alert('Seleccione un archivo');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('descripcion', descripcion);
      formData.append('archivo', archivo);

      setLoading(true);
      await subirInduccion(formData);

      // Reset
      setTitulo('');
      setDescripcion('');
      setArchivo(null);
      setMostrarForm(false);

      await cargar();
    } catch (e) {
      alert('Error al subir el documento');
    } finally {
      setLoading(false);
    }
  };

  const handleVer = async (id) => {
    try {
      const res = await descargarInduccion(id);

      const blob = new Blob([res], {
        type: 'application/pdf'
      });

      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      alert('No se pudo abrir el documento');
    }
  };

  // ======================
  // DESCARGAR DOCUMENTO
  // ======================
  const handleDescargar = async (id, nombre) => {
    try {
      const res = await descargarInduccion(id);

      const blob = new Blob([res]);
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = nombre;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('No se pudo descargar el documento');
    }
  };

  return (
    <div className="page-content">
      <h2>Inducción</h2>

      {/* ======================
          BOTÓN RRHH
         ====================== */}
      {usuario?.rol === 'rrhh' && (
        <>
          <button
            className="btn-primary"
            onClick={() => setMostrarForm(true)}
          >
            Subir documento
          </button>

          {/* ======================
              MODAL SUBIDA
             ====================== */}
          {mostrarForm && (
            <div className="modal-overlay">
              <form
                className="form-induccion"
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>Subir documento de inducción</h3>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setMostrarForm(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="modal-body">
                  <label htmlFor="titulo">
                    Título
                    <input
                      id="titulo"
                      name="titulo"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      required
                    />
                  </label>

                  <label htmlFor="descripcion">
                    Descripción
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                    />
                  </label>

                  <label htmlFor="archivo">
                    Documento (PDF o Word)
                    <input
                      id="archivo"
                      name="archivo"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setArchivo(e.target.files[0])}
                      required
                    />
                  </label>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setMostrarForm(false)}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Subiendo…' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* ======================
          LISTADO
         ====================== */}
      <div className="lista-induccion">
        {docs.length === 0 && (
          <p>No hay documentos disponibles</p>
        )}

        {docs.map((d) => (
          <div key={d.id} className="induccion-item">
            <strong>{d.titulo}</strong>
            {d.descripcion && <p>{d.descripcion}</p>}

            <div className="induccion-actions">
              <button
                className="btn-secondary"
                onClick={() => handleVer(d.id)}
              >
                Ver
              </button>

              <button
                className="btn-primary"
                onClick={() => handleDescargar(d.id, d.titulo)}
              >
                Descargar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Induccion;
