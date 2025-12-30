// backend/src/queries/usuarios/usuarioQueries.js
const pool = require('../../config/database');

const usuarioQueries = {
  
  // 1. Buscar usuario por email
  findByEmail: async (email) => {
    try {
      const query = 'SELECT * FROM usuarios WHERE email = $1';
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ [QUERY] Error en findByEmail:', error.message);
      throw error;
    }
  },

  // 2. Buscar usuario por CI
  findByCI: async (ci) => {
    try {
      const query = 'SELECT * FROM usuarios WHERE ci = $1';
      const result = await pool.query(query, [ci]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ [QUERY] Error en findByCI:', error.message);
      throw error;
    }
  },

  // 3. Crear nuevo usuario
  create: async (usuarioData) => {
    try {
      const { ci, extension_ci, email, password_hash, nombre_completo, rol } = usuarioData;
      
      const query = `
        INSERT INTO usuarios (ci, extension_ci, email, password_hash, nombre_completo, rol)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING ci, email, nombre_completo, rol, extension_ci
      `;
      
      const result = await pool.query(query, [
        ci, 
        extension_ci, 
        email, 
        password_hash, 
        nombre_completo, 
        rol
      ]);
      
      return result.rows[0];
      
    } catch (error) {
      console.error('❌ [QUERY] Error en create:', error.message);
      throw error;
    }
  },

  // 4. Actualizar contraseña
  updatePassword: async (ci, passwordHash) => {
    try {
      const query = `
        UPDATE usuarios 
        SET password_hash = $1 
        WHERE ci = $2 
        RETURNING ci, email, nombre_completo
      `;
      
      const result = await pool.query(query, [passwordHash, ci]);
      
      if (result.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      
      console.log('✅ [QUERY] Contraseña actualizada para CI:', ci);
      return result.rows[0];
      
    } catch (error) {
      console.error('❌ [QUERY] Error en updatePassword:', error.message);
      throw error;
    }
  },

  // 5. Obtener perfil completo
  getPerfilCompleto: async (ci) => {
    try {
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
      
    } catch (error) {
      console.error('❌ [QUERY] Error en getPerfilCompleto:', error.message);
      throw error;
    }
  }

};

module.exports = usuarioQueries;