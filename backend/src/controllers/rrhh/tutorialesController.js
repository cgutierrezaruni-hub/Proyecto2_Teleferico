const tutorialesQueries = require('../../queries/tutoriales/tutorialesQueries');

const tutorialesController = {
    
  listarRRHH: async (req, res) => {
    const data = await tutorialesQueries.listarRRHH();
    res.json({ success: true, data });
  },

  crear: async (req, res) => {
    try {
      const rrhh_ci = req.user.ci;
      const { titulo, video_url, descripcion } = req.body;

      if (!titulo || !video_url) {
        return res.status(400).json({
          success: false,
          error: 'Título y enlace del video son obligatorios'
        });
      }

      const tutorial = await tutorialesQueries.crear({
        titulo,
        video_url,
        descripcion,
        rrhh_ci
      });

      res.json({ success: true, tutorial });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error creando tutorial'
      });
    }
  },

  cambiarEstado: async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;

    await tutorialesQueries.cambiarEstado(id, activo);

    res.json({
      success: true,
      message: activo ? 'Tutorial activado' : 'Tutorial desactivado'
    });
  },

  listarPasante: async (req, res) => {
    const data = await tutorialesQueries.listarPasante();
    res.json({ success: true, data });
  }
};

module.exports = tutorialesController;
