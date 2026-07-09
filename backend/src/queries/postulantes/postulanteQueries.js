// backend/src/queries/postulantes/postulanteQueries.js
const pool = require('../../config/database');

const postulanteQueries = {
  // 1. Crear postulante (TU FUNCIÓN ORIGINAL)
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

  // 2. Obtener todos los postulantes (TU FUNCIÓN ORIGINAL)
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

  // 3. Actualizar estado (TU FUNCIÓN ORIGINAL)
  updateEstado: async (ci, estado) => {
    const query = 'UPDATE postulantes SET estado_postulacion = $1 WHERE usuario_ci = $2 RETURNING *';
    const result = await pool.query(query, [estado, ci]);
    return result.rows[0];
  },

  // 4. Obtener perfil completo del postulante (NUEVA)
  getPerfil: async (ci) => {
    try {
      const query = `
        SELECT p.*, u.email, u.nombre_completo, u.rol
        FROM postulantes p
        INNER JOIN usuarios u ON p.usuario_ci = u.ci
        WHERE p.usuario_ci = $1
      `;
      const result = await pool.query(query, [ci]);
      return result.rows[0];
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      throw error;
    }
  },

  // 5. Crear perfil (Solo permite una vez)
  upsertPerfil: async (postulanteData) => {
    try {
      const {
        usuario_ci, fecha_nacimiento, genero, estado_civil, tiene_hijos,
        universidad, carrera, anio_cursando, horas_acumular, numero_celular, cuenta_seguro
      } = postulanteData;

      const query = `
        INSERT INTO postulantes (
          usuario_ci, fecha_nacimiento, genero, estado_civil,
          tiene_hijos, universidad, carrera, anio_cursando,
          horas_acumular, numero_celular, cuenta_seguro, estado_postulacion
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'ENVIADO')
        ON CONFLICT (usuario_ci) 
        DO NOTHING -- <--- ESTA ES LA CLAVE: No permite actualizar si ya existe
        RETURNING *;
      `;

      const result = await pool.query(query, [
        usuario_ci, fecha_nacimiento, genero, estado_civil,
        tiene_hijos, universidad, carrera, anio_cursando,
        horas_acumular, numero_celular, cuenta_seguro
      ]);

      // Si result.rows[0] es undefined, significa que el perfil ya existía
      return result.rows[0];

    } catch (error) {
      console.error('Error en upsertPerfil:', error);
      throw error;
    }
  },

  // 6. Obtener estado de postulación (NUEVA)
  getEstado: async (ci) => {
    try {
      const query = 'SELECT estado_postulacion FROM postulantes WHERE usuario_ci = $1';
      const result = await pool.query(query, [ci]);
      return result.rows[0]?.estado_postulacion || 'pendiente';
    } catch (error) {
      console.error('Error obteniendo estado:', error);
      throw error;
    }
  },

  // 7. Verificar si existe perfil (NUEVA)
  existePerfil: async (ci) => {
    try {
      const query = 'SELECT 1 FROM postulantes WHERE usuario_ci = $1';
      const result = await pool.query(query, [ci]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error verificando perfil:', error);
      throw error;
    }
  }
};

module.exports = postulanteQueries;