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
      WHERE p.estado_postulacion = 'ENVIADO'
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
        p.estado_postulacion,
        pc.fecha_inicio,
        pc.fecha_fin
      FROM pasantes_contratados pc
      JOIN usuarios u ON u.ci = pc.usuario_ci
      JOIN postulantes p ON p.usuario_ci = pc.usuario_ci
      JOIN departamentos d ON d.id = pc.departamento_id
      JOIN jefes_departamento jd ON jd.usuario_ci = pc.jefe_ci
      JOIN usuarios uj ON uj.ci = jd.usuario_ci
      WHERE p.estado_postulacion = 'ACTIVO'
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

    // 1. Verificar estado actual
    const estadoResult = await pool.query(
      `SELECT estado_postulacion 
      FROM postulantes 
      WHERE usuario_ci = $1`,
      [usuario_ci]
    );

    if (estadoResult.rowCount === 0) {
      throw new Error('El postulante no existe');
    }

    if (estadoResult.rows[0].estado_postulacion !== 'ENVIADO') {
      throw new Error('Solo se puede asignar postulantes en estado ENVIADO');
    }

    // 2. Verificar si ya existe en pasantes_contratados
    const existe = await pool.query(
      `SELECT 1 FROM pasantes_contratados WHERE usuario_ci = $1`,
      [usuario_ci]
    );

    let pasante;

    if (existe.rowCount > 0) {
      // 🔁 UPDATE (re-asignación)
      const updateQuery = `
        UPDATE pasantes_contratados
        SET departamento_id = $2,
            jefe_ci = $3,
            rrhh_induccion_ci = $4,
            fecha_inicio = $5,
            fecha_fin = $6,
            horario = $7,
            modalidad = $8
        WHERE usuario_ci = $1
        RETURNING *
      `;

      const { rows } = await pool.query(updateQuery, [
        usuario_ci,
        departamento_id,
        jefe_ci,
        rrhh_ci,
        fecha_inicio,
        fecha_fin,
        horario || null,
        modalidad || null
      ]);

      pasante = rows[0];
    } else {
      // ➕ INSERT (primera vez)
      const insertQuery = `
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

      const { rows } = await pool.query(insertQuery, [
        usuario_ci,
        departamento_id,
        jefe_ci,
        rrhh_ci,
        fecha_inicio,
        fecha_fin,
        horario || null,
        modalidad || null
      ]);

      pasante = rows[0];
    }

    // 3. Cambiar estado a ACTIVO
    await pool.query(
      `UPDATE postulantes 
      SET estado_postulacion = 'ACTIVO'
      WHERE usuario_ci = $1`,
      [usuario_ci]
    );

    return pasante;
  },


  //6. Reubicar pasante
  reubicarPasante: async ({ usuario_ci, departamento_id, jefe_ci }) => {
    // Verificar que el pasante esté ACTIVO
    const estado = await pool.query(
      `SELECT estado_postulacion FROM postulantes WHERE usuario_ci = $1`,
      [usuario_ci]
    );

    if (estado.rowCount === 0) {
      throw new Error('El pasante no existe');
    }

    if (estado.rows[0].estado_postulacion !== 'ACTIVO') {
      throw new Error('Solo se pueden reubicar pasantes en estado ACTIVO');
    }

    const query = `
      UPDATE pasantes_contratados
      SET departamento_id = $2,
          jefe_ci = $3
      WHERE usuario_ci = $1
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      usuario_ci,
      departamento_id,
      jefe_ci
    ]);

    if (rows.length === 0) {
      throw new Error('El pasante no está asignado');
    }

    return rows[0];
  },

  cambiarEstadoPasante: async ({ usuario_ci, estado }) => {
    const estadosValidos = ['FINALIZADO', 'RETIRADO'];

    if (!estadosValidos.includes(estado)) {
      throw new Error('Estado no válido');
    }

    const estadoActual = await pool.query(
      `SELECT estado_postulacion
      FROM postulantes
      WHERE usuario_ci = $1`,
      [usuario_ci]
    );

    if (estadoActual.rowCount === 0) {
      throw new Error('El pasante no existe');
    }

    if (estadoActual.rows[0].estado_postulacion !== 'ACTIVO') {
      throw new Error('Solo se puede finalizar o retirar pasantes ACTIVOS');
    }

    await pool.query(
      `UPDATE postulantes
      SET estado_postulacion = $2
      WHERE usuario_ci = $1`,
      [usuario_ci, estado]
    );

    return true;
  },

  //8. 
  getPasantesHistorico: async () => {
    const query = `
      SELECT 
        pc.usuario_ci,
        u.nombre_completo AS nombre_pasante,
        p.carrera,
        p.universidad,
        d.nombre_area AS area,
        p.estado_postulacion,
        pc.fecha_fin
      FROM pasantes_contratados pc
      JOIN usuarios u ON u.ci = pc.usuario_ci
      JOIN postulantes p ON p.usuario_ci = pc.usuario_ci
      JOIN departamentos d ON d.id = pc.departamento_id
      WHERE p.estado_postulacion IN ('FINALIZADO', 'RETIRADO')
      ORDER BY pc.fecha_fin DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },
};

module.exports = rrhhQueries;
