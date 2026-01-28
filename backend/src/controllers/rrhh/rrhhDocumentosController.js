const path = require('path');
const pool = require('../../config/database');

const BASE_UPLOADS = path.resolve(__dirname, '../../../uploads/postulantes');

const rrhhDocumentosController = {

  listarDocumentosPostulante: async (req, res) => {
    try {
      const { postulante_ci } = req.params;

      const result = await pool.query(
        `
        SELECT id, tipo, archivo_ruta, fecha_subida
        FROM documentos_postulante
        WHERE postulante_ci = $1
        ORDER BY fecha_subida ASC
        `,
        [postulante_ci]
      );

      const docs = result.rows.filter(d => d.tipo !== 'ENVIO_CONFIRMADO');

      return res.json({
        success: true,
        documentos: docs
      });
    } catch (error) {
      console.error('Error listando documentos RRHH:', error);
      return res.status(500).json({
        success: false,
        error: 'Error listando documentos'
      });
    }
  },

    descargarDocumento: async (req, res) => {
    try {
        const { postulante_ci, tipo } = req.params;

        const result = await pool.query(
        `
        SELECT archivo_ruta
        FROM documentos_postulante
        WHERE postulante_ci = $1 AND tipo = $2
        LIMIT 1
        `,
        [postulante_ci, tipo]
        );

        if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: 'Documento no encontrado'
        });
        }

        const rutaEnBD = result.rows[0].archivo_ruta;
        const rutaAbs = path.resolve(rutaEnBD);

        if (!rutaAbs.startsWith(BASE_UPLOADS)) {
        return res.status(403).json({
            success: false,
            error: 'Ruta no permitida'
        });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
        'Content-Disposition',
        'inline; filename=' + path.basename(rutaAbs)
        );

        return res.sendFile(rutaAbs);

    } catch (error) {
        console.error('Error descargando documento RRHH:', error);
        return res.status(500).json({
        success: false,
        error: 'Error descargando documento'
        });
    }
    }

};

module.exports = rrhhDocumentosController;
