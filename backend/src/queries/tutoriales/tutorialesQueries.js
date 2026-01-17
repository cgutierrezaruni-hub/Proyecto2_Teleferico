const pool = require('../../config/database');

const tutorialesQueries = {

  // ======================
  // RRHH
  // ======================
  listarRRHH: async () => {
    const { rows } = await pool.query(
      `SELECT id, titulo, video_url, descripcion, activo
       FROM tutoriales
       ORDER BY id DESC`
    );
    return rows;
  },

  crear: async ({ titulo, video_url, descripcion, rrhh_ci }) => {
    const { rows } = await pool.query(
      `INSERT INTO tutoriales
       (titulo, video_url, descripcion, subido_por_rrhh_ci)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [titulo, video_url, descripcion, rrhh_ci]
    );
    return rows[0];
  },

  cambiarEstado: async (id, activo) => {
    await pool.query(
      `UPDATE tutoriales
       SET activo = $2
       WHERE id = $1`,
      [id, activo]
    );
  },

  // ======================
  // PASANTE ACTIVO
  // ======================
  listarPasante: async () => {
    const { rows } = await pool.query(
      `SELECT id, titulo, video_url, descripcion
       FROM tutoriales
       WHERE activo = true
       ORDER BY id DESC`
    );
    return rows;
  }
};

module.exports = tutorialesQueries;
