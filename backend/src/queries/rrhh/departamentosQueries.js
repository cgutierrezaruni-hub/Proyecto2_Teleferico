const pool = require('../../config/database');

const departamentosQueries = {

  listarDepartamentosConResumen: async () => {
    const query = `
      SELECT
        d.id,
        d.nombre_area,
        u.nombre_completo AS jefe_departamento,
        COUNT(pc.usuario_ci) AS total_pasantes
      FROM departamentos d
      LEFT JOIN jefes_departamento jd 
        ON jd.departamento_id = d.id AND jd.activo = true
      LEFT JOIN usuarios u 
        ON u.ci = jd.usuario_ci
      LEFT JOIN pasantes_contratados pc 
        ON pc.departamento_id = d.id
      GROUP BY d.id, d.nombre_area, u.nombre_completo
      ORDER BY d.nombre_area
    `;

    const { rows } = await pool.query(query);
    return rows;
  },

  listarPasantesPorDepartamento: async (departamentoId) => {
    const query = `
      SELECT
        u.ci,
        u.nombre_completo,
        p.carrera,
        p.universidad,
        pc.fecha_inicio,
        pc.fecha_fin
      FROM pasantes_contratados pc
      JOIN usuarios u ON u.ci = pc.usuario_ci
      JOIN postulantes p ON p.usuario_ci = pc.usuario_ci
      WHERE pc.departamento_id = $1
      ORDER BY u.nombre_completo
    `;

    const { rows } = await pool.query(query, [departamentoId]);
    return rows;
  }

};

module.exports = departamentosQueries;
