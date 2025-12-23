const pool = require('../../config/database');

const usuarioQueries = {
  // 1. Buscar usuario por email
  findByEmail: async (email) => {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  // 2. Buscar usuario por CI
  findByCI: async (ci) => {
    const query = 'SELECT * FROM usuarios WHERE ci = $1';
    const result = await pool.query(query, [ci]);
    return result.rows[0];
  },

  // 3. Crear nuevo usuario
  create: async (usuarioData) => {
    const { ci, extension_ci, email, password_hash, nombre_completo, rol } = usuarioData;
    const query = `
      INSERT INTO usuarios (ci, extension_ci, email, password_hash, nombre_completo, rol)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [ci, extension_ci, email, password_hash, nombre_completo, rol]);
    return result.rows[0];
  },

  // 4. Obtener perfil completo
  getPerfilCompleto: async (ci) => {
    const query = `
      SELECT u.*, 
             p.estado_postulacion,
             j.departamento_id,
             d.nombre_area as departamento_nombre
      FROM usuarios u
      LEFT JOIN postulantes p ON u.ci = p.usuario_ci
      LEFT JOIN jefes_departamento j ON u.ci = j.usuario_ci
      LEFT JOIN departamentos d ON j.departamento_id = d.id
      WHERE u.ci = $1
    `;
    const result = await pool.query(query, [ci]);
    return result.rows[0];
  }
};

module.exports = usuarioQueries;