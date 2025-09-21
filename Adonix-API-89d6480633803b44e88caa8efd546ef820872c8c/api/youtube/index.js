import axios from 'axios';
import crypto from 'crypto';

const CONFIG = {
  API_BASE: "https://api3.apiapi.lat",
  API_ENDPOINTS: [
    "https://api5.apiapi.lat",
    "https://api.apiapi.lat",
    "https://api3.apiapi.lat"
  ],
  HEADERS: {
    'authority': 'api.apiapi.lat',
    'content-type': 'application/json',
    'origin': 'https://ogmp3.lat',
    'referer': 'https://ogmp3.lat/',
    // User-Agent actualizado para Chrome 127 en Windows 10 (actualizado para Julio 2025)
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
    'accept': 'application/json, text/plain, */*'
  },
  FORMATS: {
    video: ['240', '360', '480', '720', '1080'],
    audio: ['64', '96', '192', '256', '320']
  },
  DEFAULT_FMT: {
    video: '1080', // Calidad de video máxima por defecto
    audio: '320' // Calidad de audio máxima por defecto
  },
  RESTRICTED_TIMEZONES: new Set(["-330", "-420", "-480", "-540"]), // Offsets en minutos de UTC
  MAX_RETRY_ATTEMPTS: 300,
  MAX_DOWNLOAD_RETRIES: 20,
  RETRY_DELAY_MS: 2000,
};

const utils = {
  hash: () => crypto.randomBytes(16).toString('hex'),

  encoded: (str) => {
    let result = "";
    for (let i = 0; i < str.length; i++) {
      result += String.fromCharCode(str.charCodeAt(i) ^ 1);
    }
    return result;
  },

  enc_url: (url, separator = ",") => {
    const codes = [];
    for (let i = 0; i < url.length; i++) {
      codes.push(url.charCodeAt(i));
    }
    return codes.join(separator).split(separator).reverse().join(separator);
  },

  isUrl: str => {
    try {
      const url = new URL(str);
      const hostname = url.hostname.toLowerCase();
      const ytHosts = [/^(.+\.)?youtube\.com$/, /^(.+\.)?youtube-nocookie\.com$/, /^youtu\.be$/];
      return ytHosts.some(a => a.test(hostname)) && !url.searchParams.has("playlist");
    } catch (_) {
      return false;
    }
  },

  youtube: url => {
    if (!url) return null;
    const regexes = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ];
    for (let regex of regexes) {
      if (regex.test(url)) return url.match(regex)[1];
    }
    return null;
  },

  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

const ogmp3Service = {
  api: {
    base: CONFIG.API_BASE,
    endpoints: CONFIG.API_ENDPOINTS
  },
  headers: CONFIG.HEADERS,
  formats: CONFIG.FORMATS,
  default_fmt: CONFIG.DEFAULT_FMT,
  restrictedTimezones: CONFIG.RESTRICTED_TIMEZONES,
  utils: utils,

  request: async (endpoint, data = {}, method = 'post') => {
    try {
      // CORRECCIÓN: 'API_ENDPOINTS' con 'P' mayúscula
      const base = CONFIG.API_ENDPOINTS[Math.floor(Math.random() * CONFIG.API_ENDPOINTS.length)];
      const url = endpoint.startsWith('http') ? endpoint : `${base}${endpoint}`;

      const res = await axios({
        method,
        url,
        data: method === 'post' ? data : undefined,
        headers: CONFIG.HEADERS,
        timeout: 15000 // Aumentar el timeout para solicitudes lentas
      });

      return { status: true, code: res.status, data: res.data };
    } catch (error) {
      let statusCode = 500;
      let errorMessage = error.message;

      if (error.response) {
        statusCode = error.response.status;
        errorMessage = `HTTP ${statusCode}: ${error.response.data?.message || error.response.statusText || 'Error desconocido del servidor'}`;
        console.error(`[Request Error] HTTP Error: ${statusCode}, Data: ${JSON.stringify(error.response.data)}, URL: ${url}`);
      } else if (error.request) {
        statusCode = 504;
        errorMessage = `Error de red o Timeout: No se recibió respuesta del servidor. ${error.message}`;
        console.error(`[Request Error] Network/Timeout Error: ${errorMessage}, URL: ${url}`);
      } else {
        console.error(`[Request Error] Client-side Error: ${errorMessage}`);
      }
      return { status: false, code: statusCode, error: errorMessage };
    }
  },

  checkStatus: async function (id) {
    try {
      const c = this.utils.hash();
      const d = this.utils.hash();
      const endpoint = `/${c}/status/${this.utils.encoded(id)}/${d}/`;
      const result = await this.request(endpoint, { data: id }, 'get');
      return result;
    } catch (error) {
      console.error(`[checkStatus Error] ${error.message}`);
      return { status: false, code: 500, error: error.message };
    }
  },

  checkProgress: async function (data) {
    let attempts = 0;
    let currentDelay = CONFIG.RETRY_DELAY_MS;
    while (attempts < CONFIG.MAX_RETRY_ATTEMPTS) {
      attempts++;
      console.log(`[CheckProgress] Intento ${attempts} para ID: ${data.i}`); // Log para depuración
      const res = await this.checkStatus(data.i);

      if (!res.status) {
        console.warn(`[CheckProgress] Fallo en el intento ${attempts}, reintentando en ${currentDelay}ms. Error: ${res.error}`); // Log para depuración
        await this.utils.sleep(currentDelay);
        currentDelay *= 1.5;
        continue;
      }

      const stat = res.data;
      if (stat.s === "C") {
        console.log(`[CheckProgress] Conversión completada para ID: ${data.i}`); // Log para depuración
        return stat;
      }
      if (stat.s === "P") {
        console.log(`[CheckProgress] Conversión en progreso para ID: ${data.i}, reintentando en ${currentDelay}ms.`); // Log para depuración
        await this.utils.sleep(currentDelay);
        currentDelay *= 1.5;
        continue;
      }
      console.error(`[CheckProgress] Estado inesperado: ${stat.s} para ID: ${data.i}`); // Log para depuración
      return null;
    }
    console.error(`[CheckProgress] Se alcanzó el número máximo de intentos para ID: ${data.i}`); // Log para depuración
    return null;
  },

  download: async function (link, format, type = 'audio') {
    if (!link) return { status: false, code: 400, error: "❌ Falta el link." };
    if (!this.utils.isUrl(link)) return { status: false, code: 400, error: "❌ Link de YouTube no válido." };
    if (type !== 'video' && type !== 'audio') return { status: false, code: 400, error: "❌ Tipo inválido. Debe ser 'video' o 'audio'." };

    let selectedFormat = format;
    if (!selectedFormat) {
      selectedFormat = type === 'audio' ? this.default_fmt.audio : this.default_fmt.video;
      console.log(`[Download] Usando formato por defecto: ${selectedFormat} para ${type}`);
    }

    const validFormats = type === 'audio' ? this.formats.audio : this.formats.video;
    if (!validFormats.includes(selectedFormat)) {
      return { status: false, code: 400, error: `❌ Formato '${selectedFormat}' inválido para ${type}. Opciones: ${validFormats.join(', ')}` };
    }

    const id = this.utils.youtube(link);
    if (!id) return { status: false, code: 400, error: "❌ No se pudo extraer la ID del video de YouTube." };

    let retries = 0;
    while (retries < CONFIG.MAX_DOWNLOAD_RETRIES) {
      retries++;
      let currentDelay = CONFIG.RETRY_DELAY_MS;
      console.log(`[Download] Intento ${retries} para iniciar la conversión de: ${link}`); // Log para depuración

      const c = this.utils.hash();
      const d = this.utils.hash();

      const currentTimezoneOffset = new Date().getTimezoneOffset().toString();
      // Falsificar la zona horaria si la tuya está restringida.
      const userTimeZone = CONFIG.RESTRICTED_TIMEZONES.has(currentTimezoneOffset) ? '0' : currentTimezoneOffset; // '0' es UTC

      const reqPayload = {
        data: this.utils.encoded(link),
        format: type === 'audio' ? "0" : "1",
        referer: "https://ogmp3.cc", // O el referer original del sitio ogmp3.lat si es diferente
        mp3Quality: type === 'audio' ? selectedFormat : null,
        mp4Quality: type === 'video' ? selectedFormat : null,
        userTimeZone: userTimeZone // Usar la zona horaria real o la falsificada
      };

      const res = await this.request(`/${c}/init/${this.utils.enc_url(link)}/${d}/`, reqPayload);

      if (!res.status) {
        console.warn(`[Download] Fallo en el intento ${retries} al iniciar conversión. Reintentando en ${currentDelay}ms. Error: ${res.error}`);
        await this.utils.sleep(currentDelay);
        currentDelay *= 1.5;
        if (retries === CONFIG.MAX_DOWNLOAD_RETRIES) return res;
        continue;
      }

      const data = res.data;
      console.log(`[Download] Respuesta inicial de la API:`, data);

      if (data.le) return { status: false, code: 400, error: "⏱️ Video muy largo (máximo 3 horas)." };
      if (data.i === "blacklisted") return { status: false, code: 429, error: "🚫 Límite diario de conversiones alcanzado." };
      if (data.e || data.i === "invalid") return { status: false, code: 400, error: "📛 Video borrado o restringido." };

      if (data.s === "C") {
        console.log(`[Download] Video ya convertido para ID: ${data.i}`);
        return {
          status: true,
          code: 200,
          result: {
            title: data.t || "Sin título",
            type,
            format: selectedFormat,
            thumbnail: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
            download: `${this.api.base}/${this.utils.hash()}/download/${this.utils.encoded(data.i)}/${this.utils.hash()}/`,
            id,
            quality: selectedFormat
          }
        };
      }

      console.log(`[Download] Video en progreso o iniciando. Verificando progreso para ID: ${data.i}`);
      const proc = await this.checkProgress(data);
      if (proc && proc.s === "C") {
        console.log(`[Download] Conversión completada después de monitoreo para ID: ${proc.i}`);
        return {
          status: true,
          code: 200,
          result: {
            title: proc.t || "Sin título",
            type,
            format: selectedFormat,
            thumbnail: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
            download: `${this.api.base}/${this.utils.hash()}/download/${this.utils.encoded(proc.i)}/${this.utils.hash()}/`,
            id,
            quality: selectedFormat
          }
        };
      }
      console.warn(`[Download] La conversión no se completó exitosamente después de todos los reintentos para: ${link}`);
      return { status: false, code: 500, error: "❌ La conversión no pudo completarse. Intente de nuevo más tarde." };
    }
    return { status: false, code: 500, error: "❌ Se agotaron los intentos para iniciar la conversión." };
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '❌ Método no permitido. Use GET.' });
  }

  try {
    const { url } = req.query;
    const type = req.query.type || 'audio';
    let format;

    if (type === 'video') {
      format = req.query.format || CONFIG.DEFAULT_FMT.video;
    } else {
      format = req.query.format || CONFIG.DEFAULT_FMT.audio;
    }

    console.log(`[API Handler] Recibida solicitud para URL: ${url}, Formato: ${format}, Tipo: ${type}`);

    if (!url) {
      return res.status(400).json({ error: '❌ Falta el parámetro ?url=' });
    }

    const result = await ogmp3Service.download(url, format, type);

    if (!result.status) {
      console.error(`[API Handler] Error en la conversión: ${result.error || 'Desconocido'}`);
      return res.status(result.code || 500).json({ error: result.error || '❌ Falló la descarga o la conversión.' });
    }

    const { title, download: downloadLink } = result.result;

    const cleanTitle = title.replace(/[\\/:*?"<>|]/g, '').slice(0, 100);
    const filename = `${cleanTitle}.${type === 'audio' ? 'mp3' : 'mp4'}`;

    console.log(`[API Handler] Conversión exitosa. Enlace de descarga: ${downloadLink}`);
    return res.status(200).json({
      status: 200,
      creator: 'adonix-scraper-improved',
      result: {
        creator: 'Ado (Wirk)',
        title,
        [type]: downloadLink,
        format,
        type,
        filename
      }
    });
  } catch (e) {
    console.error(`[API Handler] Error interno del servidor: ${e.message}`, e);
    return res.status(500).json({ error: '❌ Error interno del servidor.', debug: e.message });
  }
}
