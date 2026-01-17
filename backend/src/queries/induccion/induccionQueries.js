const pool = require('../../config/database');

const induccionQueries = {

  // RRHH: listar documentos
  listarDocumentosRRHH: async () => {
    const { rows } = await pool.query(
      `SELECT id, titulo, descripcion, tipo, fecha_subida, activo
       FROM induccion_documentos
       ORDER BY fecha_subida DESC`
    );
    return rows;
  },

  // RRHH: insertar documento
  crearDocumento: async ({ titulo, descripcion, archivo_ruta, tipo, rrhh_ci }) => {
    const { rows } = await pool.query(
      `INSERT INTO induccion_documentos
       (titulo, descripcion, archivo_ruta, tipo, subido_por_rrhh_ci)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [titulo, descripcion, archivo_ruta, tipo, rrhh_ci]
    );
    return rows[0];
  },

  // PASANTE ACTIVO: listar solo activos
  listarDocumentosPasante: async () => {
    const { rows } = await pool.query(
      `SELECT id, titulo, descripcion, tipo, archivo_ruta, fecha_subida
       FROM induccion_documentos
       WHERE activo = true
       ORDER BY fecha_subida DESC`
    );
    return rows;
  },

  obtenerDocumentoPorId: async (id) => {
    const { rows } = await pool.query(
      `SELECT archivo_ruta
       FROM induccion_documentos
       WHERE id = $1 AND activo = true`,
      [id]
    );
    return rows[0];
  }
};

module.exports = induccionQueries;
