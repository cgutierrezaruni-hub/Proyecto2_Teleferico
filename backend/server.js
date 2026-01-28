// Archivo PRINCIPAL del servidor
const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
  console.log(`Base de datos: ${process.env.DB_NAME}`);
});