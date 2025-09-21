import { Router } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import fetch from 'node-fetch';

const router = Router();

const headers = {
  accept: '*/*',
  'content-type': 'application/json',
  origin: 'https://yt.savetube.me',
  referer: 'https://yt.savetube.me/',
  'user-agent': 'Postify/1.0.0'
};

const formats = ['144', '240', '360', '480', '720', '1080', 'mp3'];

const isUrl = str => {
  try {
    const url = new URL(str);
    return url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be');
  } catch {
    return false;
  }
};

const youtube = url => {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const hexToBuffer = hex => Buffer.from(hex.match(/.{1,2}/g).join(''), 'hex');

const decrypt = encrypted => {
  try {
    const key = hexToBuffer('C5D58EF67A7584E4A29F6C35BBC4EB12');
    const buffer = Buffer.from(encrypted, 'base64');
    const iv = buffer.slice(0, 16);
    const content = buffer.slice(16);
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    const decrypted = Buffer.concat([
      decipher.update(content),
      decipher.final()
    ]);
    return JSON.parse(decrypted.toString());
  } catch (e) {
    return null;
  }
};

const request = async (endpoint, data = {}, method = 'post') => {
  const base = 'https://media.savetube.me/api';
  try {
    const res = await axios({
      method,
      url: endpoint.startsWith('http') ? endpoint : base + endpoint,
      data: method === 'post' ? data : undefined,
      params: method === 'get' ? data : undefined,
      headers
    });
    return { status: true, data: res.data };
  } catch (e) {
    return { status: false, error: e.message };
  }
};

async function ytmp4ApiHandler(req, res) {
  const { url, format = '360' } = req.query;

  if (!url) return res.status(400).json({ status: false, message: '❗ Falta el parámetro ?url=' });
  if (!isUrl(url)) return res.status(400).json({ status: false, message: '❗ URL inválida o no es de YouTube' });
  if (!formats.includes(format)) {
    return res.status(400).json({
      status: false,
      message: '❗ Formato inválido',
      disponibles: formats
    });
  }

  try {
    const id = youtube(url);
    if (!id) return res.status(400).json({ status: false, message: '❗ No se pudo extraer el ID del video' });

    const cdnRes = await request('/random-cdn', {}, 'get');
    if (!cdnRes.status || !cdnRes.data?.cdn) throw new Error('❌ Fallo al obtener el CDN');

    const cdn = cdnRes.data.cdn;
    const infoRes = await request(`https://${cdn}/v2/info`, {
      url: `https://www.youtube.com/watch?v=${id}`
    });

    if (!infoRes.status || !infoRes.data?.data) throw new Error('❌ No se pudo obtener info del video');

    const decrypted = decrypt(infoRes.data.data);
    if (!decrypted || !decrypted.key || !decrypted.title) {
      throw new Error('❌ No se pudo descifrar la información del video');
    }

    const downloadRes = await request(`https://${cdn}/download`, {
      id,
      downloadType: format === 'mp3' ? 'audio' : 'video',
      quality: format,
      key: decrypted.key
    });

    const downloadUrl = downloadRes?.data?.data?.downloadUrl;

    if (!downloadRes.status || !downloadUrl || !downloadUrl.startsWith('http')) {
      return res.status(500).json({
        status: false,
        message: '❌ No se pudo obtener el link de descarga válido'
      });
    }

    // Para el dashboard, si se pide un stream, hacer proxy
    if (req.headers.accept?.includes('video/')) {
        const mediaResponse = await fetch(downloadUrl);
        res.setHeader('Content-Type', mediaResponse.headers.get('content-type'));
        res.setHeader('Content-Length', mediaResponse.headers.get('content-length'));
        mediaResponse.body.pipe(res);
    } else {
        return res.status(200).json({
          status: true,
          creator: 'Ado',
          result: {
            title: decrypted.title,
            thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
            quality: format,
            download: downloadUrl
          }
        });
    }
  } catch (err) {
    console.error('[❌ ERROR INTERNO]', err);
    return res.status(500).json({
      status: false,
      message: '❌ Error interno del servidor',
      error: err.message
    });
  }
}

router.get('/', ytmp4ApiHandler);
router.post('/', ytmp4ApiHandler);

export default router;
