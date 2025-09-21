import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

router.get('/', async (req, res) => {
  const query = req.query.q;
  const show = req.query.show || 5;
  const apikey = 'GataDios';
  const url = `https://api.neoxr.eu/api/pinterest-v2?q=${encodeURIComponent(query)}&show=${show}&type=video&apikey=${apikey}`;

  if (!query) {
    return res.status(400).json({
      status: 400,
      error: '❌ Faltó el parámetro ?q= para buscar'
    });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.status || !data.data) {
      return res.status(500).json({
        status: 500,
        error: '❌ Error al obtener resultados',
        detalle: data?.msg || 'Sin detalles'
      });
    }

    const videos = data.data.map((v, i) => ({
      titulo: v.title || 'Sin título',
      creador: 'Ado ( Wirk )',
      autor: v.author.full_name || 'Desconocido',
      usuario: '@' + v.author.username,
      thumbnail: v.content[0]?.thumbnail || null,
      video: v.content[0]?.url || null,
      fuente: v.source
    }));

    return res.status(200).json({
      status: 200,
      resultados: videos.length,
      query,
      videos
    });

  } catch (err) {
    console.error('❌ Error al buscar en Pinterest:', err);
    return res.status(500).json({
      status: 500,
      error: '⚠️ Error al hacer la búsqueda',
      detalle: err.message
    });
  }
});

export default router;
