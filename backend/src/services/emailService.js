const emailjs = require('@emailjs/nodejs');

// Inicializar EmailJS con credenciales
emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY
});

const emailService = {
  
  // Enviar código de recuperacion
  sendRecoveryCode: async (email, codigo) => {
    try {
      console.log(`Enviando código ${codigo} a: ${email}`);
      
      // Enviar email con EmailJS (solo 3 parámetros)
      const response = await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,      
        process.env.EMAILJS_TEMPLATE_ID,     
        {
          to_email: email,                   // Email del destinatario
          to_name: email.split('@')[0],      // Nombre del usuario
          recovery_code: codigo,             // El código de 6 dígitos
          app_name: 'Sistema de Pasantías'   // Nombre de tu app
        }
      );
      
      console.log('Email enviado exitosamente');
      return true;
      
    } catch (error) {
      console.error('Error enviando email:', error.message);
      throw error; // Simplemente propaga el error
    }
  }
  
};

module.exports = emailService;