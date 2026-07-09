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
        modalidad,
        talla_chamarra,    // Recibimos del fronted
        numero_credencial  // Recibimos del frontend
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
        modalidad,
        talla_chamarra,   // Pasamos a agregar
        numero_credencial // Pasamos a agregar
      });

      res.json({
        success: true,
        message: 'Pasante asignado correctamente',
        pasante
      });

    } catch (error) {
        console.error('Error asignando pasante:', error.message);

        return res.status(400).json({
          success: false,
          error: error.message || 'Error asignando pasante'
        });
      }
  },

  reubicarPasante: async (req, res) => {
    try {
      const { usuario_ci, departamento_id, jefe_ci } = req.body;

      if (!usuario_ci || !departamento_id || !jefe_ci) {
        return res.status(400).json({
          success: false,
          error: 'Datos incompletos para reubicar pasante'
        });
      }

      const pasante = await rrhhQueries.reubicarPasante({
        usuario_ci,
        departamento_id,
        jefe_ci
      });

      res.json({
        success: true,
        message: 'Pasante reubicado correctamente',
        pasante
      });

    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  cambiarEstadoPasante: async (req, res) => {
    try {
      const { usuario_ci, estado } = req.body;

      if (!usuario_ci || !estado) {
        return res.status(400).json({
          success: false,
          error: 'Datos incompletos'
        });
      }

      await rrhhQueries.cambiarEstadoPasante({ usuario_ci, estado });

      return res.json({
        success: true,
        message:
          estado === 'FINALIZADO'
            ? 'Pasantía finalizada correctamente'
            : 'Pasante retirado correctamente'
      });

    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  listarPasantesHistorico: async (req, res) => {
    try {
      const data = await rrhhQueries.getPasantesHistorico();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error listando histórico de pasantes'
      });
    }
  },
};

module.exports = rrhhController;
