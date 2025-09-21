import express from 'express'
import cors from 'cors'
import axios from 'axios'
import * as cheerio from 'cheerio'

const app = express()
app.use(cors())

app.get('/api/pinterest', async (req, res) => {
  const q = req.query.q
  if (!q) return res.status(400).json({ status: false, message: 'Falta parámetro ?q=' })

  try {
    const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(q)}`
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      }
    })

    const $ = cheerio.load(data)
    const results = []

    // Busca todas las imágenes que tengan pinimg.com en src
    $('img').each((i, el) => {
      const src = $(el).attr('src')
      if (src && src.includes('pinimg.com')) results.push(src)
    })

    // Quita duplicados y limita a 20
    const uniqueResults = [...new Set(results)].slice(0, 20)

    if (uniqueResults.length === 0) {
      return res.json({ status: false, message: 'No se encontraron resultados' })
    }

    res.json({
      status: true,
      creator: 'Ado',
      results: uniqueResults
    })

  } catch (error) {
    res.status(500).json({ status: false, message: 'Error al buscar en Pinterest', error: error.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`API Pinterest corriendo en puerto ${PORT}`))
