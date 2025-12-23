const pool = require('../../config/database');

const entrevistaQueries = {
  // 1. Crear entrevista
  create: async (entrevistaData) => {
    const { postulante_ci, jefe_ci, rrhh_ci, fecha_hora, estado } = entrevistaData;
    
    const query = `
      INSERT INTO entrevistas (postulante_ci, jefe_ci, rrhh_ci, fecha_hora, estado)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(query, [postulante_ci, jefe_ci, rrhh_ci, fecha_hora, estado]);
    return result.rows[0];
  },

  // 2. Obtener entrevistas de un postulante
  getByPostulante: async (postulanteCI) => {
    const query = `
      SELECT e.*, 
             u.nombre_completo as jefe_nombre,
             j.departamento_id,
             d.nombre_area as departamento_nombre
      FROM entrevistas e
      JOIN jefes_departamento j ON e.jefe_ci = j.usuario_ci
      JOIN usuarios u ON j.usuario_ci = u.ci
      LEFT JOIN departamentos d ON j.departamento_id = d.id
      WHERE e.postulante_ci = $1
      ORDER BY e.fecha_hora DESC
    `;
    const result = await pool.query(query, [postulanteCI]);
    return result.rows;
  },

  // 3. Actualizar estado de entrevista
  updateEstado: async (id, estado) => {
    const query = 'UPDATE entrevistas SET estado = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [estado, id]);
    return result.rows[0];
  }
};

module.exports = entrevistaQueries;