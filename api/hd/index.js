import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

async function handler(req, res) {
  const imagen = req.query.url || req.body?.url || req.query.imagen; // Compatibilidad con dashboard

  if (!imagen) {
    return res.status(400).json({
      status: 400,
      error: '❌ Faltó la imagen. Usá ?url=URL_de_la_imagen'
    });
  }

  try {
    const apiURL = `https://api.neoxr.eu/api/remini?image=${encodeURIComponent(imagen)}&apikey=GataDios`;
    const response = await fetch(apiURL);

    // La API externa podría devolver la imagen directamente
    if (response.headers.get('content-type')?.startsWith('image/')) {
        res.setHeader('Content-Type', response.headers.get('content-type'));
        response.body.pipe(res);
    } else {
        const data = await response.json();
        if (!data.status) throw new Error(data.message || 'Error de la API externa');

        // Si la respuesta es JSON pero contiene una URL de imagen
        if (data.result?.url) {
            // Redirigir a la URL de la imagen o enviar la URL en JSON
             const imageResponse = await fetch(data.result.url);
             res.setHeader('Content-Type', imageResponse.headers.get('content-type'));
             imageResponse.body.pipe(res);
        } else {
             res.status(500).json({
                status: 500,
                error: '❌ La API externa no devolvió una imagen válida'
            });
        }
    }
  } catch (err) {
    console.error('🔥 Error en HD:', err.message);
    return res.status(500).json({
      status: 500,
      error: '❌ Error procesando la imagen',
      detalle: err.message
    });
  }
}

router.get('/', handler);
router.post('/', handler);

export default router;
