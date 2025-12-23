// backend/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioQueries = require('../queries/usuarios/usuarioQueries');
const pool = require('../config/database');

const authController = {
  // ============ LOGIN SIMPLIFICADO ============
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('🔐 Login intento para:', email);
      
      // 1. Buscar usuario
      const usuario = await usuarioQueries.findByEmail(email);
      if (!usuario) {
        console.log('❌ Usuario no encontrado');
        return res.status(401).json({ 
          success: false, 
          error: 'Credenciales incorrectas' 
        });
      }
      
      console.log('✅ Usuario encontrado:', usuario.email);
      console.log('📏 Longitud hash:', usuario.password_hash?.length || 'null');
      
      // 2. Verificar contraseña SIMPLE
      let passwordValido = false;
      
      // Opción 1: Si es texto plano, comparar directamente
      if (usuario.password_hash === password) {
        console.log('✅ Contraseña coincide (texto plano)');
        passwordValido = true;
      }
      // Opción 2: Si es hash bcrypt, usar bcrypt.compare
      else if (usuario.password_hash && usuario.password_hash.startsWith('$2a$')) {
        try {
          passwordValido = await bcrypt.compare(password, usuario.password_hash);
          console.log('🔐 Resultado bcrypt.compare:', passwordValido);
        } catch (bcryptError) {
          console.log('⚠️ Error bcrypt:', bcryptError.message);
        }
      }
      
      if (!passwordValido) {
        console.log('❌ Contraseña incorrecta');
        return res.status(401).json({ 
          success: false, 
          error: 'Credenciales incorrectas' 
        });
      }
      
      // 3. Crear token JWT
      const token = jwt.sign(
        {
          ci: usuario.ci,
          email: usuario.email,
          rol: usuario.rol,
          nombre: usuario.nombre_completo
        },
        process.env.JWT_SECRET || 'secret_key_desarrollo',
        { expiresIn: '24h' }
      );
      
      console.log('🎉 Login exitoso! Token generado');
      
      // 4. Responder
      res.json({
        success: true,
        message: 'Login exitoso',
        token,
        user: {
          ci: usuario.ci,
          email: usuario.email,
          nombre: usuario.nombre_completo,
          rol: usuario.rol
        }
      });
      
    } catch (error) {
      console.error('🔥 Error en login:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  },

  // ============ REGISTRO ============
  register: async (req, res) => {
    try {
      const { ci, email, password, nombre_completo, extension_ci } = req.body;
      
      // Validaciones básicas
      if (!ci || !email || !password || !nombre_completo) {
        return res.status(400).json({ 
          success: false, 
          error: 'Faltan datos requeridos' 
        });
      }
      
      // Verificar si ya existe
      const existe = await usuarioQueries.findByEmail(email);
      if (existe) {
        return res.status(400).json({ 
          success: false, 
          error: 'El email ya está registrado' 
        });
      }
      
      // Hashear contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      // Crear usuario
      const nuevoUsuario = await usuarioQueries.create({
        ci: parseInt(ci),
        extension_ci: extension_ci || 'LP',
        email,
        password_hash: passwordHash,
        nombre_completo,
        rol: 'postulante'
      });
      
      res.status(201).json({
        success: true,
        message: 'Registro exitoso',
        user: {
          ci: nuevoUsuario.ci,
          email: nuevoUsuario.email,
          nombre: nuevoUsuario.nombre_completo,
          rol: nuevoUsuario.rol
        }
      });
      
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error en el servidor' 
      });
    }
  },

  // ============ VERIFICAR TOKEN ============
  verifyToken: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ 
          success: false,
          error: 'Token no proporcionado' 
        });
      }
      
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret_key_desarrollo'
      );
      
      res.json({ 
        success: true,
        valid: true, 
        user: decoded 
      });
      
    } catch (error) {
      console.log('❌ Token inválido:', error.message);
      res.status(401).json({ 
        success: false,
        error: 'Token inválido o expirado' 
      });
    }
  },

  // ============ OBTENER USUARIO ACTUAL ============
  getCurrentUser: async (req, res) => {
    try {
      // req.user viene del middleware
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Usuario no autenticado' 
        });
      }
      
      const usuario = await usuarioQueries.findByCI(req.user.ci);
      
      if (!usuario) {
        return res.status(404).json({ 
          success: false,
          error: 'Usuario no encontrado' 
        });
      }
      
      // No enviar el hash de contraseña
      delete usuario.password_hash;
      
      res.json({
        success: true,
        user: usuario
      });
      
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno' 
      });
    }
  },

  // ============ FUNCIONES FALTANTES (temporales) ============
  
  forgotPassword: async (req, res) => {
    // Función temporal - implementar después
    res.json({
      success: true,
      message: 'Función en desarrollo'
    });
  },

  verifyRecoveryCode: async (req, res) => {
    // Función temporal - implementar después
    res.json({
      success: true,
      message: 'Función en desarrollo'
    });
  },

  resetPassword: async (req, res) => {
    // Función temporal - implementar después
    res.json({
      success: true,
      message: 'Función en desarrollo'
    });
  }
};

module.exports = authController;