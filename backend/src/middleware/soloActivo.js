const pool = require('../config/database');

const soloPasanteActivo = async (req, res, next) => {
  try {
    const ci = req.user.ci;

    const result = await pool.query(
      `SELECT estado_postulacion
       FROM postulantes
       WHERE usuario_ci = $1`,
      [ci]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({
        success: false,
        error: 'Postulante no encontrado'
      });
    }

    if (result.rows[0].estado_postulacion !== 'ACTIVO') {
      return res.status(403).json({
        success: false,
        error: 'Acceso permitido solo a pasantes activos'
      });
    }

    next();
  } catch (error) {
    console.error('Error validando pasante activo:', error);
    res.status(500).json({
      success: false,
      error: 'Error validando estado del pasante'
    });
  }
};

module.exports = { soloPasanteActivo };
