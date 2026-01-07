// backend/src/routes/documentosRoutes.js
const express = require('express');
const multer = require('multer');
const documentosController = require('../controllers/documentosController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Configuración de multer
 * - Carpeta temporal (tmp/)
 * - Tamaño máximo definido en .env
 */
const upload = multer({
  dest: 'tmp/',
  limits: {
    fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024
  }
});

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * POST /api/documentos/subir
 * Body:
 *  - tipo (string)
 * File:
 *  - archivo (multipart/form-data)
 */
router.post(
  '/subir',
  upload.single('archivo'),
  documentosController.subirDocumento
);

/**
 * GET /api/documentos
 * Lista documentos del postulante autenticado
 */
router.get(
  '/',
  documentosController.listarDocumentos
);

/**
 * POST /api/documentos/confirmar
 * Confirma envío final y bloquea modificaciones
 */
router.post(
  '/confirmar',
  documentosController.confirmarEnvio
);

module.exports = router;
