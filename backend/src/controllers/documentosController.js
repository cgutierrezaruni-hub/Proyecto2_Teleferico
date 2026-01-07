// backend/src/controllers/documentosController.js
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

// Tipos de documentos permitidos (control empresarial)
const TIPOS_DOCUMENTO_PERMITIDOS = [
  'carta_solicitud',
  'certificado_notas',
  'hoja_vida',
  'ci',
  'factura_servicio',
  'croquis_domicilio',
  'referencias_personales'
];

// Directorio final de almacenamiento
const UPLOADS_DIR = path.join(__dirname, '../../uploads/postulantes');

const documentosController = {

  /**
   * POST /api/documentos/subir
   * Sube un documento y lo registra en BD
   */
  subirDocumento: async (req, res) => {
    try {
      const ci = req.user.ci;
      const { tipo } = req.body;

      // Validaciones básicas
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Archivo requerido'
        });
      }

      if (!tipo || !TIPOS_DOCUMENTO_PERMITIDOS.includes(tipo)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de documento no válido'
        });
      }

      // Verificar si ya confirmó envío
      const confirmacion = await pool.query(
        `SELECT 1 FROM documentos_postulante WHERE postulante_ci = $1 AND tipo = 'ENVIO_CONFIRMADO'`,
        [ci]
      );

      if (confirmacion.rows.length > 0) {
        return res.status(403).json({
          success: false,
          error: 'Los documentos ya fueron confirmados. No se permiten cambios.'
        });
      }

      // Crear carpeta del postulante si no existe
      const carpetaPostulante = path.join(UPLOADS_DIR, ci.toString());
      if (!fs.existsSync(carpetaPostulante)) {
        fs.mkdirSync(carpetaPostulante, { recursive: true });
      }

      // Nombre final del archivo
      const extension = path.extname(req.file.originalname);
      const nombreArchivo = `${tipo}${extension}`;
      const rutaFinal = path.join(carpetaPostulante, nombreArchivo);

      // Mover archivo desde tmp/
      fs.renameSync(req.file.path, rutaFinal);

      // Guardar registro en BD
      await pool.query(
        `
        INSERT INTO documentos_postulante (postulante_ci, tipo, archivo_ruta)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
        `,
        [ci, tipo, rutaFinal]
      );

      res.json({
        success: true,
        message: 'Documento subido correctamente'
      });

    } catch (error) {
      console.error('Error subiendo documento:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno al subir documento'
      });
    }
  },

  /**
   * GET /api/documentos
   * Lista documentos del postulante
   */
  listarDocumentos: async (req, res) => {
    try {
      const ci = req.user.ci;

      const result = await pool.query(
        `
        SELECT tipo, archivo_ruta, fecha_subida
        FROM documentos_postulante
        WHERE postulante_ci = $1
        ORDER BY fecha_subida
        `,
        [ci]
      );

      res.json({
        success: true,
        documentos: result.rows
      });

    } catch (error) {
      console.error('Error listando documentos:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo documentos'
      });
    }
  },

  /**
   * POST /api/documentos/confirmar
   * Confirma envío final y bloquea modificaciones
   */
  confirmarEnvio: async (req, res) => {
    try {
      const ci = req.user.ci;

      await pool.query(
        `
        INSERT INTO documentos_postulante (postulante_ci, tipo, archivo_ruta)
        VALUES ($1, 'ENVIO_CONFIRMADO', 'CONFIRMADO')
        `,
        [ci]
      );

      res.json({
        success: true,
        message: 'Documentos confirmados. Ya no se permiten modificaciones.'
      });

    } catch (error) {
      console.error('Error confirmando documentos:', error);
      res.status(500).json({
        success: false,
        error: 'Error confirmando envío'
      });
    }
  }
};

module.exports = documentosController;
