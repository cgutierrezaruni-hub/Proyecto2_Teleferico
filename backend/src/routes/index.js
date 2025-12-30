const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const postulanteRoutes = require('./postulanteRoutes');

// Todas las rutas empiezan con /api
router.use('/auth', authRoutes);
router.use('/postulante', postulanteRoutes);

// Ruta de prueba
router.get('/test', (req, res) => {
  res.json({ mensaje: 'API funcionando', version: '1.0.0' });
});

module.exports = router;