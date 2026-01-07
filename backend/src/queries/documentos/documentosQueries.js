// backend/src/queries/documentos/documentosQueries.js
const pool = require('../../config/database');

/**
 * Tipos de documentos permitidos (lista cerrada)
 * El campo "tipo" en BD debe usar uno de estos valores.
 */
const DOCUMENTOS_REQUERIDOS = [
  'carta_solicitud',
  'certificado_notas',
  'hoja_vida',
  'ci',
  'factura_servicio',
  'croquis_domicilio',
  'referencias_personales'
];

const documentosQueries = {
  DOCUMENTOS_REQUERIDOS,

  /**
   * Inserta un documento en la tabla documentos_postulante.
   * Importante: no reemplaza; la lógica de "no duplicar" se valida antes.
   */
  insertarDocumento: async ({ postulante_ci, tipo, archivo_ruta }) => {
    const query = `
      INSERT INTO documentos_postulante (postulante_ci, tipo, archivo_ruta)
      VALUES ($1, $2, $3)
      RETURNING id, postulante_ci, tipo, archivo_ruta, fecha_subida
    `;
    const result = await pool.query(query, [postulante_ci, tipo, archivo_ruta]);
    return result.rows[0];
  },

  /**
   * Verifica si ya existe un documento por postulante y tipo.
   */
  existeDocumento: async ({ postulante_ci, tipo }) => {
    const query = `
      SELECT 1
      FROM documentos_postulante
      WHERE postulante_ci = $1 AND tipo = $2
      LIMIT 1
    `;
    const result = await pool.query(query, [postulante_ci, tipo]);
    return result.rows.length > 0;
  },

  /**
   * Lista documentos del postulante.
   */
  listarPorPostulante: async (postulante_ci) => {
    const query = `
      SELECT id, tipo, archivo_ruta, fecha_subida
      FROM documentos_postulante
      WHERE postulante_ci = $1
      ORDER BY fecha_subida ASC
    `;
    const result = await pool.query(query, [postulante_ci]);
    return result.rows;
  },

  /**
   * Determina si el postulante tiene todos los documentos requeridos.
   */
  tieneTodosLosDocumentos: async (postulante_ci) => {
    const query = `
      SELECT tipo
      FROM documentos_postulante
      WHERE postulante_ci = $1
    `;
    const result = await pool.query(query, [postulante_ci]);

    const tiposSubidos = result.rows.map(r => r.tipo);
    return DOCUMENTOS_REQUERIDOS.every(t => tiposSubidos.includes(t));
  }
};

module.exports = documentosQueries;
