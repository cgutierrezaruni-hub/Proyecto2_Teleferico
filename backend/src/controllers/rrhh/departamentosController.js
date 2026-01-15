const departamentosQueries = require('../../queries/rrhh/departamentosQueries');

const departamentosController = {

  listarResumen: async (req, res) => {
    try {
      const data = await departamentosQueries.listarDepartamentosConResumen();
      return res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('❌ Error listando departamentos:', error);
      return res.status(500).json({
        success: false,
        error: 'Error listando departamentos'
      });
    }
  },

  listarPasantes: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID de departamento requerido'
        });
      }

      const data = await departamentosQueries.listarPasantesPorDepartamento(id);

      return res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('❌ Error listando pasantes del departamento:', error);
      return res.status(500).json({
        success: false,
        error: 'Error listando pasantes'
      });
    }
  }

};

module.exports = departamentosController;