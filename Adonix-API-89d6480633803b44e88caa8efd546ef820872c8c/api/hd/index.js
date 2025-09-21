import fetch from 'node-fetch';

export default async function handler(req, res) {
  const imagen = req.query.imagen;

  if (!imagen) {
    return res.status(400).json({
      status: 400,
      error: '❌ Faltó la imagen. Usá ?imagen=URL'
    });
  }

  try {
    const apiURL = `https://api.neoxr.eu/api/remini?image=${encodeURIComponent(imagen)}&apikey=GataDios`;
    const response = await fetch(apiURL);
    const data = await response.json();

    if (!data.status) throw new Error('Error de la API externa');

    return res.status(200).json({
      status: 200,
      mensaje: '🖼 Imagen mejorada con éxito',
      url_mejorada: data.result?.url || null,
      powered_by: 'Ado ( Wirk )',
      timestamp: new Date().toLocaleString('es-HN')
    });
  } catch (err) {
    console.error('🔥 Error en HD:', err.message);
    return res.status(500).json({
      status: 500,
      error: '❌ Error procesando la imagen',
      detalle: err.message
    });
  }
}
