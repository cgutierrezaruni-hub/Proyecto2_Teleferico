const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const { soloPasanteActivo } = require('../middleware/soloActivo');
const tutorialesController = require('../controllers/rrhh/tutorialesController');

router.use(authenticateToken);

// GET /api/tutoriales/rrhh
router.get('/rrhh', tutorialesController.listarRRHH);

// POST /api/tutoriales/rrhh
router.post('/rrhh', tutorialesController.crear);

// PUT /api/tutoriales/rrhh/:id/estado
router.put('/rrhh/:id/estado', tutorialesController.cambiarEstado);

// GET /api/tutoriales/pasante
router.get('/pasante', soloPasanteActivo, tutorialesController.listarPasante);

module.exports = router;
