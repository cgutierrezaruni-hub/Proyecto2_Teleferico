const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const postulanteRoutes = require('./postulanteRoutes');
const documentosRoutes = require('./documentosRoutes');
const rrhhRoutes = require('./rrhhRoutes');

// Todas las rutas empiezan con /api
router.use('/auth', authRoutes);
router.use('/postulante', postulanteRoutes);
router.use('/documentos', documentosRoutes);
router.use('/rrhh', rrhhRoutes);

// Ruta de prueba
router.get('/test', (req, res) => {
  res.json({ mensaje: 'API funcionando', version: '1.0.0' });
});

module.exports = router;
