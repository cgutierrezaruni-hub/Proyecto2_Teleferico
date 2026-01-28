const express = require('express');
const router = express.Router();
const postulanteController = require('../controllers/postulanteController');
const { authenticateToken } = require('../middleware/auth');

// Middleware para verificar que sea postulante
const verificarPostulante = (req, res, next) => {
  if (req.user.rol !== 'postulante') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Solo para postulantes.'
    });
  }
  next();
};

// Todas las rutas requieren autenticación y ser postulante
router.use(authenticateToken);
router.use(verificarPostulante);

// RUTAS PARA POSTULANTES

// GET /api/postulante/perfil - Obtener perfil completo
router.get('/perfil', postulanteController.getPerfil);

// POST /api/postulante/perfil - Crear o actualizar perfil
router.post('/perfil', postulanteController.upsertPerfil);

// GET /api/postulante/estado - Obtener estado de postulación
router.get('/estado', postulanteController.getEstado);

// GET /api/postulante/verificar-perfil - Verificar si tiene perfil completo
router.get('/verificar-perfil', postulanteController.verificarPerfilCompleto);

module.exports = router;