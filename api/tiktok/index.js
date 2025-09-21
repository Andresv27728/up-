import fetch from 'node-fetch';

export default async function handler(req, res) {
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

    const result = {
      title: json.data.title || 'Sin título',
      author: {
        name: json.data.author.nickname,
        username: json.data.author.unique_id
      },
      thumbnail: json.data.cover,
      duration: json.data.duration,
      video: json.data.play, // HD sin marca
      audio: json.data.music,
      likes: json.data.digg_count,
      comments: json.data.comment_count,
      shares: json.data.share_count,
      views: json.data.play_count
    };

    res.status(200).json({
      status: 200,
      creator: 'theadonix-api.vercel.app',
      result: {
        creator: 'Ado ( Wirk )',
        ...result
      }
    });

  } catch (e) {
    res.status(500).json({
      status: 500,
      error: 'Error interno del servidor',
      debug: e.message
    });
  }
}
