import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      status: 400,
      error: 'Falta el parámetro ?url='
    });
  }

  try {
    const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
    const response = await fetch(api);
    const json = await response.json();

    if (!json.data || !json.data.play) {
      return res.status(500).json({
        status: 500,
        error: 'No se pudo obtener el video'
      });
    }

    // Para el dashboard, queremos el video directamente
    const videoUrl = json.data.play;
    const videoResponse = await fetch(videoUrl);

    if (!videoResponse.ok) {
        return res.status(500).json({ error: 'No se pudo descargar el video de la URL proporcionada por la API externa.' });
    }

    res.setHeader('Content-Type', videoResponse.headers.get('content-type'));
    res.setHeader('Content-Length', videoResponse.headers.get('content-length'));
    videoResponse.body.pipe(res);

  } catch (e) {
    res.status(500).json({
      status: 500,
      error: 'Error interno del servidor',
      debug: e.message
    });
  }
}

router.get('/', handler);
router.post('/', handler);

export default router;
