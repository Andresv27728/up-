import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

// Importa tus routers manualmente
import ytmp4Router from './api/ytmp4/index.js'
import hdRouter from './api/hd/index.js'

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Monta tus endpoints bien definidos
app.use('/api/ytmp4', ytmp4Router)
app.use('/api/hd', hdRouter)

// Redirige root a index.html si tienes frontend
app.get('/', (req, res) => {
  res.redirect('/index.html')
})

// Sirve archivos estáticos desde la carpeta raíz (donde está index.html)
app.use(express.static(__dirname))

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
