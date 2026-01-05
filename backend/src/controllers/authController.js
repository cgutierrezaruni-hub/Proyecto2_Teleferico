// backend/src/controllers/authController.js - VERSIÓN SEGURA
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioQueries = require('../queries/usuarios/usuarioQueries');
const passwordResetQueries = require('../queries/passwordResetQueries');
const nodemailer = require('nodemailer');

// ================= HELPERS =================

const isBcryptHash = (h) => typeof h === 'string' && /^\$2[aby]\$/.test(h);
const isLikelyPlain = (h) => typeof h === 'string' && !h.includes('$');

const migratePlainPasswordIfNeeded = async (usuario, plainPassword) => {
  if (!usuario || !usuario.password_hash) return false;
  if (isBcryptHash(usuario.password_hash)) return false;
  if (!isLikelyPlain(usuario.password_hash)) return false;

  if (usuario.password_hash === plainPassword) {
    try {
      const salt = await bcrypt.genSalt(10);
      const newHashed = await bcrypt.hash(plainPassword, salt);
      await usuarioQueries.updatePassword(usuario.ci, newHashed);
      console.log(`🔁 Migración exitosa a bcrypt para: ${usuario.email}`);
      return true;
    } catch (err) {
      console.error('❌ Error actualizando password durante migración:', err);
      return true;
    }
  }
  return false;
};

const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
};

const sendRecoveryEmail = async (email, code) => {
  const transporter = createTransporter();
  const subject = 'Recuperación de contraseña';
  const text = `Tu código de recuperación es: ${code}. Expira en 15 minutos.`;

  if (transporter) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject,
      text
    });
    return { sent: true };
  } else {
    // En desarrollo o si no hay SMTP, loguear el código
    console.log(`✉️ Recovery code for ${email}: ${code}`);
    return { sent: false, code };
  }
};

// ================= CONTROLLER =================

const authController = {

  // ==============================================
  // LOGIN - VERSIÓN SEGURA
  // ==============================================
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('🔐 Login intento para:', email);
      
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
      
      // 3. VERIFICACIÓN SEGURA CON BCRYPT
      let passwordValido = false;

      if (usuario.password_hash) {
        if (isBcryptHash(usuario.password_hash)) {
          try {
            passwordValido = await bcrypt.compare(password, usuario.password_hash);
          } catch (bcryptErr) {
            console.error('🔥 Error en bcrypt.compare:', bcryptErr);
            passwordValido = false;
          }
        } else {
          // Solo migramos si parece texto plano
          const migrado = await migratePlainPasswordIfNeeded(usuario, password);
          passwordValido = migrado;
        }
      }
      
      // 4. Si la contraseña es incorrecta
      if (!passwordValido) {
        console.log('❌ Contraseña incorrecta');
        return res.status(401).json({ 
          success: false, 
          error: 'Credenciales incorrectas' 
        });
      }
      
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
  // REGISTRO - VERSIÓN SEGURA (SIEMPRE HASH)
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
      
      // Verificar longitud de contraseña
      if (password.length < 6) {
        return res.status(400).json({ 
          success: false, 
          error: 'La contraseña debe tener al menos 6 caracteres' 
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
      
      // ========== ¡SIEMPRE CREAR HASH BCRYPT! ==========
      console.log('🔐 Creando hash seguro para nueva contraseña...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log('✅ Hash creado');
      
      // Crear usuario con HASH, NO texto plano
      const nuevoUsuario = await usuarioQueries.create({
        ci: parseInt(ci, 10),
        extension_ci: extension_ci || 'LP',
        email: email,
        password_hash: hashedPassword,  // ← ¡HASH SEGURO!
        nombre_completo: nombre_completo,
        rol: 'postulante'
      });
      
      console.log('✅ Usuario registrado con hash:', email);
      
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
      console.error('🔥 Error en registro:', error.message || error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al registrar usuario' 
      });
    }
  },

  // ==============================================
  // MIGRAR USUARIOS EXISTENTES A BCRYPT
  // ==============================================
  migrateUsersToBcrypt: async (req, res) => {
    try {
      console.log('🔄 Iniciando migración de usuarios a bcrypt...');
      
      // PERMISOS corregidos: permitir en dev o admin
      if (process.env.NODE_ENV !== 'development' && req.user?.rol !== 'admin') {
        return res.status(403).json({ success: false, error: 'No autorizado' });
      }

      const usuarios = await usuarioQueries.findAll();
      let migrados = 0;
      let errores = 0;

      for (const usuario of usuarios) {
        try {
          if (!usuario.password_hash) continue;

          if (isBcryptHash(usuario.password_hash)) {
            continue; // ya está bien
          }

          if (!isLikelyPlain(usuario.password_hash)) {
            console.log(`⚠️ Omitido (no es texto plano ni bcrypt): ${usuario.email}`);
            continue; // evitar re-hashear otros tipos de hash
          }

          // migrar texto plano
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(usuario.password_hash, salt);
          await usuarioQueries.updatePassword(usuario.ci, hashedPassword);
          migrados++;
        } catch (error) {
          errores++;
          console.error(`❌ Error migrando usuario ${usuario.email}:`, error);
        }
      }

      console.log(`🎉 Migración completada: ${migrados} migrados, ${errores} errores`);
      
      res.json({
        success: true,
        message: 'Migración completada',
        stats: {
          total: usuarios.length,
          migrados,
          errores
        }
      });
      
    } catch (error) {
      console.error('🔥 Error en migración:', error.message || error);
      res.status(500).json({ 
        success: false, 
        error: 'Error en migración' 
      });
    }
  },

  // ==============================================
  // VERIFICAR TOKEN
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
        process.env.JWT_SECRET || 'secret_key_desarrollo'
      );
      
      console.log('✅ Token válido para:', decoded.email);
      
      res.json({ 
        success: true,
        valid: true, 
        user: decoded 
      });
      
    } catch (error) {
      console.log('❌ Token inválido:', error.message || error);
      res.status(401).json({ 
        success: false,
        error: 'Token inválido o expirado' 
      });
    }
  },

  // ==============================================
  // OBTENER USUARIO ACTUAL
  // ==============================================
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
      
      // eliminar campo sensible antes de responder
      if (usuario.password_hash) delete usuario.password_hash;
      
      res.json({
        success: true,
        user: usuario
      });
      
    } catch (error) {
      console.error('🔥 Error en getCurrentUser:', error.message || error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor' 
      });
    }
  },

  // ========== RECUPERACIÓN ==========

  // 1) solicitar código de recuperación
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ success: false, error: 'Email es requerido' });

      // Evitar enumeración: responder success aunque no exista el usuario
      const usuario = await usuarioQueries.findByEmail(email);

      // Generar código de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      // Guardar/actualizar en tabla password_resets
      await passwordResetQueries.upsert(email, code, expiresAt);

      // Enviar email (o log en dev)
      const emailResult = await sendRecoveryEmail(email, code);

      // En respuesta en desarrollo incluimos el código para facilitar pruebas
      const response = { success: true, message: 'Si existe la cuenta, se envió un código de recuperación.' };
      if (process.env.NODE_ENV === 'development' && !emailResult.sent) response.code = code;

      res.json(response);
    } catch (error) {
      console.error('🔥 Error en forgotPassword:', error);
      res.status(500).json({ success: false, error: 'Error al solicitar recuperación' });
    }
  },

  // 2) verificar código
  verifyRecoveryCode: async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) return res.status(400).json({ success: false, error: 'Email y código son requeridos' });

      const record = await passwordResetQueries.findByEmail(email);
      if (!record) return res.status(400).json({ success: false, error: 'Código inválido' });

      const now = new Date();
      if (record.code !== code || new Date(record.expires_at) < now) {
        return res.status(400).json({ success: false, error: 'Código inválido o expirado' });
      }

      res.json({ success: true, message: 'Código válido' });
    } catch (error) {
      console.error('🔥 Error en verifyRecoveryCode:', error);
      res.status(500).json({ success: false, error: 'Error al verificar código' });
    }
  },

  // 3) resetear contraseña con código
  resetPassword: async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) return res.status(400).json({ success: false, error: 'Email, código y nueva contraseña son requeridos' });
      if (newPassword.length < 6) return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres' });

      const record = await passwordResetQueries.findByEmail(email);
      if (!record) return res.status(400).json({ success: false, error: 'Código inválido' });

      const now = new Date();
      if (record.code !== code || new Date(record.expires_at) < now) {
        return res.status(400).json({ success: false, error: 'Código inválido o expirado' });
      }

      const usuario = await usuarioQueries.findByEmail(email);
      if (!usuario) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(newPassword, salt);

      await usuarioQueries.updatePassword(usuario.ci, hashed);
      await passwordResetQueries.deleteByEmail(email);

      res.json({ success: true, message: 'Contraseña restablecida correctamente' });
    } catch (error) {
      console.error('🔥 Error en resetPassword:', error);
      res.status(500).json({ success: false, error: 'Error al restablecer contraseña' });
    }
  }

};

module.exports = authController;