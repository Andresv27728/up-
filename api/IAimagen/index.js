import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

router.get('/', async (req, res) => {
  const prompt = req.query.prompt;
  if (!prompt) {
    return res.status(400).json({
      status: 400,
      mensaje: 'Falta el parámetro ?prompt='
    });
  }

  try {
    const api = `https://api.dorratz.com/v3/ai-image?prompt=${encodeURIComponent(prompt)}`;
    const response = await fetch(api);
    const json = await response.json();

    if (!json?.data?.image_link) {
      throw new Error('No se recibió una URL de imagen válida de la API externa.');
    }

    res.status(200).json({
      status: 200,
      creator: 'Ado ( Wirk )',
      result: {
        prompt: prompt,
        image: json.data.image_link
      }
    });

  } catch (err) {
    console.error(`❌ Error al generar imagen: ${err.message}`);
    res.status(500).json({
      status: 500,
      mensaje: '❌ No se pudo generar la imagen',
      creator: 'Ado ( Wirk )'
    });
  }
});

export default router;
