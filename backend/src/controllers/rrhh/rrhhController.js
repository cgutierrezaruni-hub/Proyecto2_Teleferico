const rrhhQueries = require('../../queries/rrhh/rrhhQueries');

const rrhhController = {

  listarPostulantes: async (req, res) => {
    try {
      const data = await rrhhQueries.getPostulantes();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error listando postulantes' });
    }
  },

  listarPasantes: async (req, res) => {
    try {
      const data = await rrhhQueries.getPasantes();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error listando pasantes' });
    }
  },

  listarDepartamentos: async (req, res) => {
    try {
      const data = await rrhhQueries.getDepartamentos();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error listando departamentos' });
    }
  },

  listarJefesPorDepartamento: async (req, res) => {
    try {
      const { departamentoId } = req.params;
      const data = await rrhhQueries.getJefesPorDepartamento(departamentoId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error listando jefes' });
    }
  },

  asignarPasante: async (req, res) => {
    try {
      const rrhh_ci = req.user.ci;

      const {
        usuario_ci,
        departamento_id,
        jefe_ci,
        fecha_inicio,
        fecha_fin,
        horario,
        modalidad
      } = req.body;

      // VALIDACIÓN CRÍTICA
      if (!usuario_ci || !departamento_id || !jefe_ci || !fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          success: false,
          error: 'Faltan datos obligatorios para asignar el pasante'
        });
      }

      const pasante = await rrhhQueries.asignarPasante({
        usuario_ci,
        departamento_id,
        jefe_ci,
        rrhh_ci,
        fecha_inicio,
        fecha_fin,
        horario,
        modalidad
      });

      res.json({
        success: true,
        message: 'Pasante asignado correctamente',
        pasante
      });

    } catch (error) {
      console.error('❌ Error asignando pasante:', error);
      res.status(500).json({
        success: false,
        error: 'Error asignando pasante'
      });
    }
  }

};

module.exports = rrhhController;
