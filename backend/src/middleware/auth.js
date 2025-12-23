// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Token de autenticación requerido' 
      });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'secret_key_desarrollo', (err, user) => {
      if (err) {
        console.log('❌ Token inválido:', err.message);
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            success: false,
            error: 'Token expirado' 
          });
        }
        
        return res.status(403).json({ 
          success: false,
          error: 'Token inválido' 
        });
      }
      
      req.user = user;
      console.log('✅ Token válido para:', user.email);
      next();
    });
    
  } catch (error) {
    console.error('Error en middleware:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error de autenticación' 
    });
  }
};

module.exports = { authenticateToken };