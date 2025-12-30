// backend/src/controllers/postulanteController.js
const postulanteQueries = require('../queries/postulantes/postulanteQueries');

const postulanteController = {
  // Obtener perfil del postulante
  getPerfil: async (req, res) => {
    try {
      const ci = req.user.ci; // Del middleware auth
      
      const perfil = await postulanteQueries.getPerfil(ci);
      
      if (!perfil) {
        return res.status(404).json({
          success: false,
          error: 'Perfil no encontrado'
        });
      }
      
      res.json({
        success: true,
        perfil: perfil
      });
      
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  // Crear o actualizar perfil
  upsertPerfil: async (req, res) => {
    try {
      const ci = req.user.ci;
      
      // Verificar que el usuario sea postulante
      if (req.user.rol !== 'postulante') {
        return res.status(403).json({
          success: false,
          error: 'Solo los postulantes pueden actualizar su perfil'
        });
      }
      
      // Agregar CI a los datos del body
      const datosPerfil = {
        ...req.body,
        usuario_ci: ci
      };
      
      const perfil = await postulanteQueries.upsertPerfil(datosPerfil);
      
      res.json({
        success: true,
        message: 'Perfil actualizado correctamente',
        perfil: perfil
      });
      
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Error actualizando el perfil'
      });
    }
  },

  // Obtener estado de postulación
  getEstado: async (req, res) => {
    try {
      const ci = req.user.ci;
      
      // Verificar que sea postulante
      if (req.user.rol !== 'postulante') {
        return res.status(403).json({
          success: false,
          error: 'Acceso denegado'
        });
      }
      
      const estado = await postulanteQueries.getEstado(ci);
      
      res.json({
        success: true,
        estado: estado
      });
      
    } catch (error) {
      console.error('Error obteniendo estado:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno'
      });
    }
  },

  // Verificar si tiene perfil completo
  verificarPerfilCompleto: async (req, res) => {
    try {
      const ci = req.user.ci;
      
      if (req.user.rol !== 'postulante') {
        return res.json({
          success: true,
          completo: true // Si no es postulante, no necesita perfil
        });
      }
      
      const perfil = await postulanteQueries.getPerfil(ci);
      
      // Verificar campos obligatorios
      const camposObligatorios = [
        'fecha_nacimiento',
        'genero',
        'universidad', 
        'carrera',
        'anio_cursando',
        'horas_acumular',
        'numero_celular'
      ];
      
      let completo = true;
      const camposFaltantes = [];
      
      if (perfil) {
        camposObligatorios.forEach(campo => {
          if (!perfil[campo]) {
            completo = false;
            camposFaltantes.push(campo);
          }
        });
      } else {
        completo = false;
      }
      
      res.json({
        success: true,
        completo: completo,
        camposFaltantes: camposFaltantes,
        tienePerfil: !!perfil
      });
      
    } catch (error) {
      console.error('Error verificando perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno'
      });
    }
  }
};

module.exports = postulanteController;