const pool = require('../../config/database');

const rrhhQueries = {

  // 1. Postulantes NO asignados
  getPostulantes: async () => {
    const query = `
      SELECT 
        p.usuario_ci,
        u.nombre_completo,
        u.email,
        p.carrera,
        p.universidad,
        p.estado_postulacion
      FROM postulantes p
      JOIN usuarios u ON u.ci = p.usuario_ci
      WHERE p.usuario_ci NOT IN (
        SELECT usuario_ci FROM pasantes_contratados
      )
      ORDER BY u.nombre_completo
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  // 2. Pasantes asignados
  getPasantes: async () => {
    const query = `
      SELECT 
        pc.usuario_ci,
        u.nombre_completo AS nombre_pasante,
        p.carrera,
        p.universidad,
        d.nombre_area AS area,
        uj.nombre_completo AS nombre_jefe,
        pc.fecha_inicio,
        pc.fecha_fin
      FROM pasantes_contratados pc
      JOIN usuarios u ON u.ci = pc.usuario_ci
      JOIN postulantes p ON p.usuario_ci = pc.usuario_ci
      JOIN departamentos d ON d.id = pc.departamento_id
      JOIN jefes_departamento jd ON jd.usuario_ci = pc.jefe_ci
      JOIN usuarios uj ON uj.ci = jd.usuario_ci
      ORDER BY u.nombre_completo
    `;
    const { rows } = await pool.query(query);
    return rows;
  },


  // 3. Departamentos
  getDepartamentos: async () => {
    const { rows } = await pool.query(
      'SELECT id, nombre_area FROM departamentos ORDER BY nombre_area'
    );
    return rows;
  },

  // 4. Jefes por departamento
  getJefesPorDepartamento: async (departamentoId) => {
    const query = `
      SELECT 
        jd.usuario_ci,
        u.nombre_completo
      FROM jefes_departamento jd
      JOIN usuarios u ON u.ci = jd.usuario_ci
      WHERE jd.departamento_id = $1
        AND jd.activo = true
    `;
    const { rows } = await pool.query(query, [departamentoId]);
    return rows;
  },

  // 5. Asignar pasante
  asignarPasante: async (data) => {
    const {
      usuario_ci,
      departamento_id,
      jefe_ci,
      rrhh_ci,
      fecha_inicio,
      fecha_fin,
      horario,
      modalidad
    } = data;

    const query = `
      INSERT INTO pasantes_contratados (
        usuario_ci,
        departamento_id,
        jefe_ci,
        rrhh_induccion_ci,
        fecha_inicio,
        fecha_fin,
        horario,
        modalidad
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      usuario_ci,
      departamento_id,
      jefe_ci,
      rrhh_ci,
      fecha_inicio,
      fecha_fin,
      horario || null,
      modalidad || null
    ]);

    // Actualizar estado del postulante
    await pool.query(
      `UPDATE postulantes 
       SET estado_postulacion = 'asignado' 
       WHERE usuario_ci = $1`,
      [usuario_ci]
    );

    return rows[0];
  }
};

module.exports = rrhhQueries;
