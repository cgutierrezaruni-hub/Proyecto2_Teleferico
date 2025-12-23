const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioQueries = require('../queries/usuarios/usuarioQueries');
const pool = require('../config/database');

// Almacenamiento temporal para códigos de recuperación
const codigosRecuperacion = new Map();

const authController = {
  // ==============================================
  // LOGIN MEJORADO - FUNCIONA CON TEXTO PLANO Y HASH
  // ==============================================
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('🔐 [LOGIN] Intento para:', email);
      
      // 1. VALIDAR DATOS
      if (!email || !password) {
        console.log('❌ [LOGIN] Faltan credenciales');
        return res.status(400).json({ 
          success: false, 
          error: 'Email y contraseña son requeridos' 
        });
      }
      
      // 2. BUSCAR USUARIO
      const usuario = await usuarioQueries.findByEmail(email);
      if (!usuario) {
        console.log('❌ [LOGIN] Usuario no encontrado:', email);
        return res.status(401).json({ 
          success: false, 
          error: 'Credenciales incorrectas' 
        });
      }
      
      console.log('✅ [LOGIN] Usuario encontrado:', usuario.email);
      console.log('   Rol:', usuario.rol);
      console.log('   Hash length:', usuario.password_hash?.length || 'null');
      
      // 3. VERIFICAR CONTRASEÑA
      let passwordValido = false;
      
      // Opción A: Intentar bcrypt (si el hash parece ser bcrypt)
      if (usuario.password_hash && usuario.password_hash.startsWith('$2a$')) {
        try {
          passwordValido = await bcrypt.compare(password, usuario.password_hash);
          console.log('🔐 [LOGIN] bcrypt.compare resultado:', passwordValido);
        } catch (bcryptError) {
          console.log('⚠️ [LOGIN] Error bcrypt:', bcryptError.message);
        }
      }
      
      // Opción B: Si bcrypt falla o hash es texto plano
      if (!passwordValido) {
        console.log('🔄 [LOGIN] Probando comparación directa...');
        if (usuario.password_hash === password) {
          console.log('✅ [LOGIN] Contraseña coincide (texto plano)');
          passwordValido = true;
          
          // Convertir a hash bcrypt y actualizar
          const salt = await bcrypt.genSalt(10);
          const newHash = await bcrypt.hash(password, salt);
          
          await pool.query(
            'UPDATE usuarios SET password_hash = $1 WHERE email = $2',
            [newHash, email]
          );
          
          console.log('🔄 [LOGIN] Hash actualizado a bcrypt');
        }
      }
      
      // 4. SI LA CONTRASEÑA ES INCORRECTA
      if (!passwordValido) {
        console.log('❌ [LOGIN] Contraseña incorrecta para:', email);
        return res.status(401).json({ 
          success: false, 
          error: 'Credenciales incorrectas' 
        });
      }
      
      // 5. CREAR TOKEN JWT
      const token = jwt.sign(
        {
          ci: usuario.ci,
          email: usuario.email,
          rol: usuario.rol,
          nombre: usuario.nombre_completo
        },
        process.env.JWT_SECRET || 'secret_key_desarrollo_123',
        { expiresIn: '24h' }
      );
      
      console.log('🎉 [LOGIN] Éxito! Token generado para:', usuario.email);
      
      // 6. RESPONDER
      res.json({
        success: true,
        message: 'Login exitoso',
        token: token,
        user: {
          ci: usuario.ci,
          email: usuario.email,
          nombre: usuario.nombre_completo,
          rol: usuario.rol
        }
      });
      
    } catch (error) {
      console.error('🔥 [LOGIN] Error crítico:', error.message);
      console.error(error.stack);
      
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==============================================
  // REGISTRO DE POSTULANTES
  // ==============================================
  register: async (req, res) => {
    try {
      console.log('📝 [REGISTER] Nuevo registro recibido');
      
      const { ci, email, password, nombre_completo, extension_ci } = req.body;
      
      // 1. VALIDAR
      if (!ci || !email || !password || !nombre_completo) {
        console.log('❌ [REGISTER] Faltan datos');
        return res.status(400).json({ 
          success: false, 
          error: 'CI, email, contraseña y nombre son requeridos' 
        });
      }
      
      // 2. VERIFICAR SI EL EMAIL YA EXISTE
      const existe = await usuarioQueries.findByEmail(email);
      if (existe) {
        console.log('❌ [REGISTER] Email ya registrado:', email);
        return res.status(400).json({ 
          success: false, 
          error: 'El email ya está registrado' 
        });
      }
      
      // 3. HASH DE CONTRASEÑA
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      console.log('🔐 [REGISTER] Hash generado para nueva contraseña');
      
      // 4. CREAR USUARIO
      const nuevoUsuario = await usuarioQueries.create({
        ci: parseInt(ci),
        extension_ci: extension_ci || 'LP',
        email: email,
        password_hash: passwordHash,
        nombre_completo: nombre_completo,
        rol: 'postulante'
      });
      
      console.log('✅ [REGISTER] Usuario creado:', email);
      
      // 5. RESPONDER
      res.status(201).json({
        success: true,
        message: 'Registro exitoso. Ahora puedes iniciar sesión.',
        user: {
          ci: nuevoUsuario.ci,
          email: nuevoUsuario.email,
          nombre: nuevoUsuario.nombre_completo,
          rol: nuevoUsuario.rol
        }
      });
      
    } catch (error) {
      console.error('🔥 [REGISTER] Error:', error.message);
      
      res.status(500).json({ 
        success: false, 
        error: 'Error al registrar usuario',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==============================================
  // RECUPERACIÓN DE CONTRASEÑA - SIN EMAILJS (SIMPLIFICADO)
  // ==============================================
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      
      console.log('📧 [FORGOT-PW] Solicitud para:', email);
      
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email es requerido' 
        });
      }
      
      // Buscar usuario
      const usuario = await usuarioQueries.findByEmail(email);
      
      // Por seguridad, siempre responder igual
      if (!usuario) {
        console.log('⚠️ [FORGOT-PW] Email no registrado:', email);
        return res.json({ 
          success: true, 
          message: 'Si el email está registrado, recibirás instrucciones.' 
        });
      }
      
      // Generar código simple (en producción usarías EmailJS)
      const codigo = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Guardar temporalmente (10 minutos)
      codigosRecuperacion.set(email, {
        codigo: codigo,
        expira: Date.now() + 10 * 60 * 1000, // 10 minutos
        usuarioId: usuario.ci
      });
      
      console.log('🔑 [FORGOT-PW] Código generado para', email, ':', codigo);
      
      // En desarrollo: devolver el código directamente
      // En producción: aquí enviarías el email con EmailJS
      if (process.env.NODE_ENV === 'development') {
        return res.json({
          success: true,
          message: 'Código generado (modo desarrollo)',
          codigo: codigo,
          email: email
        });
      }
      
      // En producción (simulado por ahora)
      res.json({
        success: true,
        message: 'Si el email está registrado, recibirás un código de recuperación.'
      });
      
    } catch (error) {
      console.error('🔥 [FORGOT-PW] Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno' 
      });
    }
  },

  // ==============================================
  // VERIFICAR CÓDIGO DE RECUPERACIÓN
  // ==============================================
  verifyRecoveryCode: async (req, res) => {
    try {
      const { email, codigo } = req.body;
      
      console.log('🔍 [VERIFY-CODE] Verificación para:', email);
      
      if (!email || !codigo) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email y código son requeridos' 
        });
      }
      
      const datos = codigosRecuperacion.get(email);
      
      if (!datos) {
        return res.status(400).json({ 
          success: false, 
          error: 'Código no encontrado o expirado' 
        });
      }
      
      if (Date.now() > datos.expira) {
        codigosRecuperacion.delete(email);
        return res.status(400).json({ 
          success: false, 
          error: 'Código expirado' 
        });
      }
      
      if (datos.codigo !== codigo) {
        return res.status(400).json({ 
          success: false, 
          error: 'Código incorrecto' 
        });
      }
      
      console.log('✅ [VERIFY-CODE] Código válido para:', email);
      
      // Generar token para reset (válido 15 minutos)
      const resetToken = jwt.sign(
        {
          email: email,
          usuarioId: datos.usuarioId,
          tipo: 'password_reset'
        },
        process.env.JWT_SECRET || 'secret_key_desarrollo_123',
        { expiresIn: '15m' }
      );
      
      // Eliminar código ya usado
      codigosRecuperacion.delete(email);
      
      res.json({
        success: true,
        message: 'Código verificado correctamente',
        resetToken: resetToken
      });
      
    } catch (error) {
      console.error('🔥 [VERIFY-CODE] Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno' 
      });
    }
  },

  // ==============================================
  // RESETEAR CONTRASEÑA CON TOKEN
  // ==============================================
  resetPassword: async (req, res) => {
    try {
      const { resetToken, newPassword } = req.body;
      
      console.log('🔄 [RESET-PW] Reset solicitado');
      
      if (!resetToken || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          error: 'Token y nueva contraseña son requeridos' 
        });
      }
      
      // Validar nueva contraseña
      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false, 
          error: 'La contraseña debe tener al menos 6 caracteres' 
        });
      }
      
      // Verificar token
      let decoded;
      try {
        decoded = jwt.verify(
          resetToken, 
          process.env.JWT_SECRET || 'secret_key_desarrollo_123'
        );
      } catch (jwtError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Token inválido o expirado' 
        });
      }
      
      if (decoded.tipo !== 'password_reset') {
        return res.status(400).json({ 
          success: false, 
          error: 'Token inválido' 
        });
      }
      
      // Hashear nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newPassword, salt);
      
      // Actualizar en BD
      await pool.query(
        'UPDATE usuarios SET password_hash = $1 WHERE email = $2',
        [newHash, decoded.email]
      );
      
      console.log('✅ [RESET-PW] Contraseña actualizada para:', decoded.email);
      
      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.'
      });
      
    } catch (error) {
      console.error('🔥 [RESET-PW] Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno' 
      });
    }
  },

  // ==============================================
  // VERIFICAR TOKEN (para mantener sesión en frontend)
  // ==============================================
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
        process.env.JWT_SECRET || 'secret_key_desarrollo_123'
      );
      
      console.log('✅ [VERIFY-TOKEN] Token válido para:', decoded.email);
      
      res.json({ 
        success: true,
        valid: true, 
        user: decoded 
      });
      
    } catch (error) {
      console.log('❌ [VERIFY-TOKEN] Token inválido:', error.message);
      res.status(401).json({ 
        success: false,
        error: 'Token inválido o expirado' 
      });
    }
  },

  // ==============================================
  // OBTENER DATOS DEL USUARIO ACTUAL
  // ==============================================
  getCurrentUser: async (req, res) => {
    try {
      // req.user viene del middleware auth.js
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Usuario no autenticado' 
        });
      }
      
      // Obtener datos frescos de la BD
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
      console.error('🔥 [GET-USER] Error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno' 
      });
    }
  }
};

module.exports = authController;