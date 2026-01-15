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
      },
      {
        ci: 87654322,
        extension_ci: 'LP',
        email: 'postulante2@example.com',
        password: 'UserPass123',
        nombre_completo: 'María Fernanda López',
        rol: 'postulante'
      },
      {
        ci: 87654323,
        extension_ci: 'SC',
        email: 'postulante3@example.com',
        password: 'UserPass123',
        nombre_completo: 'Luis Alberto Quispe',
        rol: 'postulante'
      },
      {
        ci: 87654324,
        extension_ci: 'OR',
        email: 'postulante4@example.com',
        password: 'UserPass123',
        nombre_completo: 'Andrea Pamela Flores',
        rol: 'postulante'
      },
      {
        ci: 87654325,
        extension_ci: 'PT',
        email: 'postulante5@example.com',
        password: 'UserPass123',
        nombre_completo: 'Miguel Ángel Vargas',
        rol: 'postulante'
      },
      {
        ci: 85214796,
        extension_ci: 'LP',
        email: 'jefeMamani.rrhh@empresa.com',
        password: 'JefeRRHH123',
        nombre_completo: 'FLORES MAMANI EDWIN SANTOS',
        rol: 'jefe'
      },
      {
        ci: 10875269,
        extension_ci: 'CB',
        email: 'jefeDaza.sistemas@empresa.com',
        password: 'JefeSistemas123',
        nombre_completo: 'GRISI DAZA PABLO ANDRES',
        rol: 'jefe'
      },
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