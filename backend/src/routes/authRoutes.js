const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// ==============================================
// RUTAS PÚBLICAS (sin autenticación requerida)
// ==============================================

// POST /api/auth/login - Iniciar sesión
router.post('/login', authController.login);

// POST /api/auth/register - Registrar nuevo postulante
router.post('/register', authController.register);

// POST /api/auth/forgot-password - Solicitar recuperación
router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/verify-recovery-code - Verificar código
router.post('/verify-recovery-code', authController.verifyRecoveryCode);

// POST /api/auth/reset-password - Resetear contraseña con token
router.post('/reset-password', authController.resetPassword);

// GET /api/auth/verify-token - Verificar validez de token
router.get('/verify-token', authController.verifyToken);

// ==============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ==============================================

// GET /api/auth/me - Obtener datos del usuario actual
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;