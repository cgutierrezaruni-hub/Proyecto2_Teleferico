const express = require('express');
const multer = require('multer');
const path = require('path');

const induccionController = require('../controllers/rrhh/induccionController');
const { authenticateToken } = require('../middleware/auth');
const { soloPasanteActivo } = require('../middleware/soloActivo');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/rrhh/induccion'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.use(authenticateToken);

// GET /api/induccion/rrhh
router.get('/rrhh', induccionController.listarRRHH);

// POST /api/induccion/rrhh
router.post('/rrhh', upload.single('archivo'), induccionController.crearDocumento);

// GET /api/induccion/pasante
router.get('/pasante', soloPasanteActivo, induccionController.listarPasante);

router.get('/pasante/:id/descargar', authenticateToken, induccionController.descargar);

module.exports = router;