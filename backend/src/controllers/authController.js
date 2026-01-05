// backend/src/controllers/authController.js - VERSIÓN SEGURA
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioQueries = require('../queries/usuarios/usuarioQueries');

// ================= HELPERS =================

// Detectar hashes bcrypt válidos ($2a$, $2b$, $2y$)
const isBcryptHash = (h) => typeof h === 'string' && /^\$2[aby]\$/.test(h);

// Detectar si el valor almacenado parece texto plano (no contiene '$')
const isLikelyPlain = (h) => typeof h === 'string' && !h.includes('$');

// Intenta migrar contraseña en texto plano a bcrypt. Devuelve true si la contraseña
// proporcionada coincide con el valor almacenado (aunque la migración falle, devuelve true).
const migratePlainPasswordIfNeeded = async (usuario, plainPassword) => {
  if (!usuario || !usuario.password_hash) return false;
  if (isBcryptHash(usuario.password_hash)) return false;
  if (!isLikelyPlain(usuario.password_hash)) {
    // No es bcrypt pero tampoco parece texto plano (ej.: otro tipo de hash) -> no migrar
    return false;
  }

  if (usuario.password_hash === plainPassword) {
    try {
      const salt = await bcrypt.genSalt(10);
      const newHashed = await bcrypt.hash(plainPassword, salt);
      // Ajusta la firma si tu usuarioQueries usa otra convención
      await usuarioQueries.updatePassword(usuario.ci, newHashed);
      console.log(`🔁 Migración exitosa a bcrypt para: ${usuario.email}`);
      return true;
    } catch (err) {
      console.error('❌ Error actualizando password durante migración:', err);
      // Si la comparación fue correcta, aceptamos el login aunque la migración falló
      return true;
    }
  }

  return false;
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

  // ====== STUBS PARA RUTAS DE RECUPERACIÓN (implementar cuando quieras) ======
  forgotPassword: async (req, res) => {
    return res.status(501).json({ success: false, error: 'forgotPassword no implementado' });
  },

  verifyRecoveryCode: async (req, res) => {
    return res.status(501).json({ success: false, error: 'verifyRecoveryCode no implementado' });
  },

  resetPassword: async (req, res) => {
    return res.status(501).json({ success: false, error: 'resetPassword no implementado' });
  }

};

module.exports = authController;