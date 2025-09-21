import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar routers manualmente
import extractRouter from './api/Extract/index.js';
import iaImagenRouter from './api/IAimagen/index.js';
import adonixRouter from './api/adonix/index.js';
import adonixVozRouter from './api/adonixvoz/index.js';
import hdRouter from './api/hd/index.js';
import pinterestRouter from './api/pinterest/index.js';
import pinvidRouter from './api/pinvid/index.js';
import tiktokRouter from './api/tiktok/index.js';
import youtubeRouter from './api/youtube/index.js';
import ytmp3Router from './api/ytmp3/index.js';
import ytmp4Router from './api/ytmp4/index.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Montar endpoints
app.use('/api/Extract', extractRouter);
app.use('/api/IAimagen', iaImagenRouter);
app.use('/api/adonix', adonixRouter);
app.use('/api/adonixvoz', adonixVozRouter);
app.use('/api/hd', hdRouter);
app.use('/api/pinterest', pinterestRouter);
app.use('/api/pinvid', pinvidRouter);
app.use('/api/tiktok', tiktokRouter);
app.use('/api/youtube', youtubeRouter);
app.use('/api/ytmp3', ytmp3Router);
app.use('/api/ytmp4', ytmp4Router);

// Redirige root a index.html si tienes frontend
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// Servir archivos estáticos desde la carpeta raíz
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
