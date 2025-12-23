const pool = require('../../config/database');

const postulanteQueries = {
  // 1. Crear postulante
  create: async (postulanteData) => {
    const {
      usuario_ci, fecha_nacimiento, genero, estado_civil, tiene_hijos,
      universidad, carrera, anio_cursando, horas_acumular, numero_celular, cuenta_seguro
    } = postulanteData;
    
    const query = `
      INSERT INTO postulantes 
      (usuario_ci, fecha_nacimiento, genero, estado_civil, tiene_hijos, universidad, 
       carrera, anio_cursando, horas_acumular, numero_celular, cuenta_seguro)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      usuario_ci, fecha_nacimiento, genero, estado_civil, tiene_hijos,
      universidad, carrera, anio_cursando, horas_acumular, numero_celular, cuenta_seguro
    ]);
    
    return result.rows[0];
  },

  // 2. Obtener todos los postulantes
  getAll: async () => {
    const query = `
      SELECT p.*, u.nombre_completo, u.email, u.rol
      FROM postulantes p
      JOIN usuarios u ON p.usuario_ci = u.ci
      ORDER BY u.nombre_completo
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // 3. Actualizar estado
  updateEstado: async (ci, estado) => {
    const query = 'UPDATE postulantes SET estado_postulacion = $1 WHERE usuario_ci = $2 RETURNING *';
    const result = await pool.query(query, [estado, ci]);
    return result.rows[0];
  }
};

module.exports = postulanteQueries;