const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const rrhhController = require('../controllers/rrhh/rrhhController');
const rrhhDocumentosController = require('../controllers/rrhh/rrhhDocumentosController');


// Middleware: solo RRHH
const soloRRHH = (req, res, next) => {
  if (req.user.rol !== 'rrhh') {
    return res.status(403).json({
      success: false,
      error: 'Acceso permitido solo a Recursos Humanos'
    });
  }
  next();
};

// Todas las rutas RRHH requieren token y rol rrhh
router.use(authenticateToken);
router.use(soloRRHH);

// ===== RUTAS =====

// Postulantes no asignados
router.get('/postulantes', rrhhController.listarPostulantes);

// Pasantes asignados
router.get('/pasantes', rrhhController.listarPasantes);

// Departamentos
router.get('/departamentos', rrhhController.listarDepartamentos);

// Jefes por departamento
router.get('/jefes/:departamentoId', rrhhController.listarJefesPorDepartamento);

// Asignar pasante
router.post('/asignar-pasante', rrhhController.asignarPasante);

// Documentos de un postulante
router.get('/documentos/:postulante_ci', rrhhDocumentosController.listarDocumentosPostulante);

// Descargar documento
router.get('/documentos/:postulante_ci/:tipo', rrhhDocumentosController.descargarDocumento);


module.exports = router;
