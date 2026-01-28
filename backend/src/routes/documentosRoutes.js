const express = require('express');
const multer = require('multer');
const documentosController = require('../controllers/documentosController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const upload = multer({
  dest: 'tmp/',
  limits: {
    fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024
  }
});

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.post(
  '/subir',
  upload.single('archivo'),
  documentosController.subirDocumento
);

/*Lista documentos del postulante autenticado*/
router.get(
  '/',
  documentosController.listarDocumentos
);

router.post(
  '/confirmar',
  documentosController.confirmarEnvio
);

router.get(
  '/descargar/:tipo',
  documentosController.descargarDocumento
);

module.exports = router;