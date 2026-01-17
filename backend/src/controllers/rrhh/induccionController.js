const path = require('path');
const pool = require('../../config/database');
const induccionQueries = require('../../queries/induccion/induccionQueries');

// 📌 carpeta REAL de uploads
const BASE_UPLOADS = path.resolve(
  __dirname,
  '../../../uploads/rrhh/induccion'
);

const induccionController = {

  // =========================
  // RRHH
  // =========================
  listarRRHH: async (req, res) => {
    try {
      const data = await induccionQueries.listarDocumentosRRHH();
      res.json({ success: true, data });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, error: 'Error listando documentos' });
    }
  },

  crearDocumento: async (req, res) => {
    try {
      const rrhh_ci = req.user.ci;
      const { titulo, descripcion } = req.body;

      if (!req.file || !titulo) {
        return res.status(400).json({
          success: false,
          error: 'Título y archivo son obligatorios'
        });
      }

      const tipo = req.file.mimetype.includes('pdf') ? 'PDF' : 'WORD';

      const doc = await induccionQueries.crearDocumento({
        titulo,
        descripcion,
        archivo_ruta: req.file.path,
        tipo,
        rrhh_ci
      });

      res.json({ success: true, doc });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, error: 'Error creando documento' });
    }
  },

  // =========================
  // PASANTE ACTIVO
  // =========================
  listarPasante: async (req, res) => {
    try {
      const data = await induccionQueries.listarDocumentosPasante();
      res.json({ success: true, data });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, error: 'Error listando documentos' });
    }
  },

  // =========================
  // DESCARGAR / VER
  // =========================
  descargar: async (req, res) => {
    try {
      const { rol, ci } = req.user;
      const id = req.params.id;

      // 👉 validar pasante ACTIVO
      if (rol === 'postulante') {
        const result = await pool.query(
          `SELECT estado_postulacion
           FROM postulantes
           WHERE usuario_ci = $1`,
          [ci]
        );

        if (
          result.rowCount === 0 ||
          result.rows[0].estado_postulacion !== 'ACTIVO'
        ) {
          return res.status(403).json({
            error: 'Acceso permitido solo a pasantes activos'
          });
        }
      }

      const doc = await induccionQueries.obtenerDocumentoPorId(id);

      if (!doc) {
        return res.status(404).json({
          error: 'Documento no encontrado'
        });
      }

      const rutaAbs = path.resolve(doc.archivo_ruta);

      // 🔐 seguridad REAL
      if (!rutaAbs.startsWith(BASE_UPLOADS)) {
        return res.status(403).json({
          error: 'Ruta no permitida'
        });
      }

      // 📄 visualizar en navegador
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Content-Type', 'application/pdf');

      return res.sendFile(rutaAbs);

    } catch (error) {
      console.error('Error al descargar inducción:', error);
      res.status(500).json({ error: 'Error al descargar documento' });
    }
  }
};

module.exports = induccionController;
