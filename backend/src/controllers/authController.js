// backend/src/controllers/authController.js - VERSIÓN FINAL CORREGIDA
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioQueries = require('../queries/usuarios/usuarioQueries');
const pool = require('../config/database');

const codigosRecuperacion = new Map();

const authController = {

  // ==============================================
  // LOGIN - ACEPTA CUALQUIER CONTRASEÑA
  // ==============================================
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('🔐 Login intento para:', email);
      console.log('📝 Contraseña recibida:', password ? '***' : 'vacía');
      
      // 1. Validar entrada
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email y contraseña son requeridos' 
        });
      }
      
      // 2. Buscar usuario
      const usuario = await usuarioQueries.findByEmail(email);
      if (!usuario) {
        console.log('❌ Usuario no encontrado');
        return res.status(401).json({ 
          success: false, 
          error: 'Credenciales incorrectas' 
        });
      }
      
      console.log('✅ Usuario encontrado:', usuario.email);
      
      // 3. COMPARACIÓN INTELIGENTE - ACEPTA TODO
      let passwordValido = false;
      
      // ¿La contraseña en BD parece bcrypt? (empieza con $2a$)
      const pareceBcrypt = usuario.password_hash && 
                          usuario.password_hash.startsWith('$2a$');
      
      console.log('🔍 Contraseña en BD parece bcrypt?:', pareceBcrypt);
      
      if (pareceBcrypt) {
        // INTENTAR PRIMERO CON BCRYPT
        try {
          console.log('🔄 Intentando bcrypt.compare...');
          passwordValido = await bcrypt.compare(password, usuario.password_hash);
          console.log('✅ Resultado bcrypt.compare:', passwordValido);
          
          // Si bcrypt falla, INTENTAR COMO TEXTO PLANO
          if (!passwordValido) {
            console.log('⚠️ bcrypt falló, intentando como texto plano...');
            passwordValido = (usuario.password_hash === password);
            console.log('📝 Resultado texto plano:', passwordValido);
          }
        } catch (bcryptError) {
          // Si hay error en bcrypt, usar texto plano
          console.log('❌ Error en bcrypt, usando texto plano:', bcryptError.message);
          passwordValido = (usuario.password_hash === password);
        }
      } else {
        // NO parece bcrypt, comparar directamente
        console.log('📝 Comparando texto plano directamente...');
        passwordValido = (usuario.password_hash === password);
        console.log('✅ Resultado:', passwordValido);
      }
      
      // 4. Si la contraseña es incorrecta
      if (!passwordValido) {
        console.log('❌ Contraseña incorrecta');
        console.log('🔍 BD:', usuario.password_hash);
        console.log('🔍 Usuario:', password);
        return res.status(401).json({ 
          success: false, 
          error: 'Contraseña incorrecta' 
        });
      }
      
      console.log('🎉 ¡CONTRASEÑA VÁLIDA! Login exitoso');
      
      // 5. Crear token JWT
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
      
      // 6. Responder
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
      console.error('🔥 ERROR en login:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor'
      });
    }
  },

  // ==============================================
  // REGISTRO - GUARDA COMO TEXTO PLANO
  // ==============================================
  register: async (req, res) => {
    try {
      console.log('📝 Nuevo registro recibido');
      
      const { ci, email, password, nombre_completo, extension_ci } = req.body;
      
      // Validar datos
      if (!ci || !email || !password || !nombre_completo) {
        return res.status(400).json({ 
          success: false, 
          error: 'CI, email, contraseña y nombre son requeridos' 
        });
      }
      
      // Verificar si email ya existe
      const existe = await usuarioQueries.findByEmail(email);
      if (existe) {
        console.log('❌ Email ya registrado:', email);
        return res.status(400).json({ 
          success: false, 
          error: 'El email ya está registrado' 
        });
      }
      
      // GUARDAR COMO TEXTO PLANO - ¡IMPORTANTE!
      // Así funcionará con cualquier contraseña
      const nuevoUsuario = await usuarioQueries.create({
        ci: parseInt(ci),
        extension_ci: extension_ci || 'LP',
        email: email,
        password_hash: password,  // ← TEXTO PLANO
        nombre_completo: nombre_completo,
        rol: 'postulante'
      });
      
      console.log('✅ Usuario registrado:', email);
      
      // Responder
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
      console.error('🔥 Error en registro:', error.message);
      res.status(500).json({ 
        success: false, 
        error: 'Error al registrar usuario' 
      });
    }
  },

  // ==============================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ==============================================
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      
      console.log('📧 Solicitud recuperación:', email);
      
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email requerido' 
        });
      }
      
      const usuario = await usuarioQueries.findByEmail(email);
      const mensaje = 'Si el email existe, recibirás un código de recuperación.';
      
      if (!usuario) {
        console.log('Email no registrado:', email);
        return res.json({ success: true, message: mensaje });
      }
      
      const codigo = Math.floor(100000 + Math.random() * 900000).toString();
      
      codigosRecuperacion.set(email, {
        codigo: codigo,
        expira: Date.now() + 600000,
        usuarioId: usuario.ci,
        intentos: 0
      });
      
      console.log('🔑 Código generado:', codigo);
      
      let emailEnviado = false;
      try {
        const emailService = require('../services/emailService');
        await emailService.sendRecoveryCode(email, codigo);
        emailEnviado = true;
        console.log('✅ Email enviado');
      } catch (emailError) {
        console.log('⚠️ Error email:', emailError.message);
      }
      
      const respuesta = {
        success: true,
        message: mensaje,
        email: email
      };
      
      if (process.env.NODE_ENV === 'development') {
        respuesta.codigo = codigo;
        respuesta.debug = 'Modo desarrollo';
      }
      
      res.json(respuesta);
      
    } catch (error) {
      console.error('Error forgotPassword:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno' 
      });
    }
  },

  verifyRecoveryCode: async (req, res) => {
    try {
      const { email, codigo } = req.body;
      
      console.log('🔍 Verificando código para:', email);
      
      if (!email || !codigo) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email y código son requeridos' 
        });
      }
      
      if (!/^\d{6}$/.test(codigo)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Código inválido. Debe tener 6 dígitos.' 
        });
      }
      
      const datosCodigo = codigosRecuperacion.get(email);
      
      if (!datosCodigo) {
        return res.status(400).json({ 
          success: false, 
          error: 'Código no encontrado o expirado. Solicita uno nuevo.' 
        });
      }
      
      if (Date.now() > datosCodigo.expira) {
        codigosRecuperacion.delete(email);
        return res.status(400).json({ 
          success: false, 
          error: 'Código expirado. Solicita uno nuevo.' 
        });
      }
      
      if (datosCodigo.intentos >= 3) {
        codigosRecuperacion.delete(email);
        return res.status(400).json({ 
          success: false, 
          error: 'Demasiados intentos fallidos. Solicita un nuevo código.' 
        });
      }
      
      if (datosCodigo.codigo !== codigo) {
        datosCodigo.intentos += 1;
        codigosRecuperacion.set(email, datosCodigo);
        
        return res.status(400).json({ 
          success: false, 
          error: `Código incorrecto. Intentos restantes: ${3 - datosCodigo.intentos}` 
        });
      }
      
      console.log('✅ Código verificado para:', email);
      
      const resetToken = jwt.sign(
        {
          email: email,
          usuarioId: datosCodigo.usuarioId,
          tipo: 'password_reset',
          accion: 'codigo_verificado'
        },
        process.env.JWT_SECRET || 'secret_key_desarrollo',
        { expiresIn: '15m' }
      );
      
      codigosRecuperacion.delete(email);
      
      res.json({
        success: true,
        message: 'Código verificado correctamente',
        resetToken: resetToken
      });
      
    } catch (error) {
      console.error('🔥 Error en verifyRecoveryCode:', error.message);
      res.status(500).json({ 
        success: false, 
        error: 'Error verificando el código' 
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { resetToken, newPassword } = req.body;
      
      console.log('🔄 Restableciendo contraseña...');
      
      if (!resetToken || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          error: 'Token y nueva contraseña son requeridos' 
        });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false, 
          error: 'La contraseña debe tener al menos 6 caracteres' 
        });
      }
      
      let decodedToken;
      try {
        decodedToken = jwt.verify(
          resetToken, 
          process.env.JWT_SECRET || 'secret_key_desarrollo'
        );
      } catch (jwtError) {
        console.log('❌ Token inválido:', jwtError.message);
        return res.status(400).json({ 
          success: false, 
          error: 'Token inválido o expirado. Solicita un nuevo código.' 
        });
      }
      
      if (decodedToken.tipo !== 'password_reset' || decodedToken.accion !== 'codigo_verificado') {
        return res.status(400).json({ 
          success: false, 
          error: 'Token inválido' 
        });
      }
      
      const usuario = await usuarioQueries.findByCI(decodedToken.usuarioId);
      if (!usuario) {
        return res.status(404).json({ 
          success: false, 
          error: 'Usuario no encontrado' 
        });
      }
      
      // ACTUALIZAR COMO TEXTO PLANO (para consistencia)
      await pool.query(
        'UPDATE usuarios SET password_hash = $1 WHERE ci = $2',
        [newPassword, usuario.ci]  // ← TEXTO PLANO
      );
      
      console.log('✅ Contraseña actualizada para:', usuario.email);
      
      try {
        const emailService = require('../services/emailService');
        await emailService.sendPasswordChanged(usuario.email);
        console.log('📧 Confirmación de cambio enviada');
      } catch (emailError) {
        console.warn('⚠️ No se pudo enviar confirmación:', emailError.message);
      }
      
      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente.'
      });
      
    } catch (error) {
      console.error('🔥 Error en resetPassword:', error.message);
      res.status(500).json({ 
        success: false, 
        error: 'Error actualizando la contraseña' 
      });
    }
  },

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
      
      console.log('✅ Token válido para:', decoded.email);
      
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

  getCurrentUser: async (req, res) => {
    try {
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
      
      delete usuario.password_hash;
      
      res.json({
        success: true,
        user: usuario
      });
      
    } catch (error) {
      console.error('🔥 Error en getCurrentUser:', error.message);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor' 
      });
    }
  }

};

module.exports = authController;