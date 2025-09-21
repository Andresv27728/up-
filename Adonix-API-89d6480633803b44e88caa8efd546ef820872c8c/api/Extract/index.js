import fetch from 'node-fetch';

export default async function handler(req, res) {
  const url = req.query.url || req.body?.url;

  if (!url) {
    return res.status(400).json({
      status: 400,
      error: '❌ Faltó la URL. Usa ?url=https://ejemplo.com'
    });
  }

  try {
    const apiUrl = `https://delirius-apiofc.vercel.app/tools/htmlextract?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data || !data.html) {
      return res.status(500).json({
        status: 500,
        error: '😵 No se pudo obtener el HTML. Verifica la URL o inténtalo más tarde.'
      });
    }

    return res.status(200).json({
      status: 200,
      mensaje: '✅ HTML extraído exitosamente',
      sitio: url,
      html: data.html,
      powered_by: 'Adonix API',
      timestamp: new Date().toLocaleString('es-HN')
    });

  } catch (err) {
    console.error('❌ Error al extraer HTML:', err);
    return res.status(500).json({
      status: 500,
      error: '💥 Falló Adonix al copiar el HTML',
      detalle: err.message
    });
  }
}
