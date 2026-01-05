const dotenv = require('dotenv');
dotenv.config();

const bcrypt = require('bcryptjs');
const usuarioQueries = require('../queries/usuarios/usuarioQueries');

(async () => {
  try {
    const usuarios = [
      {
        ci: 12345678,
        extension_ci: 'LP',
        email: 'admin@example.com',
        password: 'AdminPass123',
        nombre_completo: 'Administrador Seeder',
        rol: 'admin'
      },
      {
        ci: 87654321,
        extension_ci: 'CB',
        email: 'user@example.com',
        password: 'UserPass123',
        nombre_completo: 'Usuario Seeder',
        rol: 'postulante'
      }
    ];

    for (const u of usuarios) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(u.password, salt);

      await usuarioQueries.create({
        ci: u.ci,
        extension_ci: u.extension_ci,
        email: u.email,
        password_hash: hashed,
        nombre_completo: u.nombre_completo,
        rol: u.rol
      });

      console.log(`✅ Insertado: ${u.email}`);
    }

    console.log('🎉 Seeder completado');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en seeder:', err);
    process.exit(1);
  }
})();