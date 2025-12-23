const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const apiRoutes = require('./routes/index');

const app = express();

// ========== MIDDLEWARES ==========
// CORS - Permitir solo frontend local
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Parsear JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== RUTAS ==========
// TODAS las rutas empiezan con /api
app.use('/api', apiRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    sistema: 'Pasantías Mi Teleférico',
    mensaje: 'API funcionando',
    fecha: new Date().toLocaleString(),
    ruta_correcta: '/api/auth/register'
  });
});

// Ruta para probar si llegan datos
app.post('/api/test-body', (req, res) => {
  console.log('📦 Body recibido en test:', req.body);
  res.json({
    recibido: true,
    body: req.body,
    headers: req.headers['content-type']
  });
});

module.exports = app;