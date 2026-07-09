import React, { useEffect, useState } from 'react';
import {
  getTutorialesRRHH,
  getTutorialesPasante,
  crearTutorial
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Tutoriales.css';

const Tutoriales = () => {
  const { usuario } = useAuth();
  const [lista, setLista] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const cargar = async () => {
    let res;

    if (usuario.rol === 'rrhh') {
      res = await getTutorialesRRHH();
    } else {
      res = await getTutorialesPasante();
    }

    setLista(res.data || []);
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await crearTutorial({
      titulo,
      descripcion,
      video_url: videoUrl
    });

    setTitulo('');
    setDescripcion('');
    setVideoUrl('');
    setMostrarForm(false);

    cargar();
  };

  return (
    <div className="page-content">
      <h2>Tutoriales</h2>

      {/* RRHH */}
      {usuario.rol === 'rrhh' && (
        <>
          <button
            className="btn-primary"
            onClick={() => setMostrarForm(true)}
          >
            Agregar tutorial
          </button>

          {mostrarForm && (
            <div
              className="modal-overlay"
              onClick={() => setMostrarForm(false)}
            >
              <form
                onSubmit={handleSubmit}
                className="form-tutorial"
                onClick={(e) => e.stopPropagation()}
              >
                {/* HEADER */}
                <div className="modal-header">
                  <h3>Nuevo tutorial</h3>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setMostrarForm(false)}
                  >
                    ✕
                  </button>
                </div>

                {/* BODY */}
                <div className="modal-body">
                  <label>
                    Título
                    <input
                      id="titulo"
                      name="titulo"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Descripción
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                    />
                  </label>

                  <label>
                    URL del video
                    <input
                      id="video_url"
                      name="video_url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      required
                    />
                  </label>
                </div>

                {/* ACTIONS */}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setMostrarForm(false)}
                  >
                    Cancelar
                  </button>

                  <button type="submit" className="btn-primary">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* LISTADO DE TARJETAS */}
      <div className="lista-tutoriales">
        {lista.length === 0 && (
          <p className="empty-text">No hay tutoriales disponibles en este momento.</p>
        )}

        {lista.map((t) => (
          <div key={t.id} className="tutorial-item">
            <strong>{t.titulo}</strong>
            {t.descripcion && <p>{t.descripcion}</p>}
            
            <div className="tutorial-actions">
              <a href={t.video_url} target="_blank" rel="noreferrer" className="btn-video">
                <span>▶</span> Ver video
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tutoriales;