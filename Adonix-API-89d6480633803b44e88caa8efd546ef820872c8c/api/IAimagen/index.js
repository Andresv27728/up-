import express from 'express'
import fetch from 'node-fetch'

const app = express()

app.get('/api/IAimagen', async (req, res) => {
  const prompt = req.query.prompt
  if (!prompt) return res.status(400).json({
    status: 400,
    mensaje: 'Falta ?prompt='
  })

  try {
    const api = `https://api.dorratz.com/v3/ai-image?prompt=${encodeURIComponent(prompt)}`
    const response = await fetch(api)
    const json = await response.json()

    if (!json?.data?.image_link) throw new Error('No se recibió imagen válida')

    res.status(200).json({
      status: 200,
      creator: 'Ado ( Wirk )',
      result: {
        prompt: prompt,
        image: json.data.image_link
      }
    })

  } catch (err) {
    console.log(`❌ Error al generar imagen: ${err.message}`)
    res.status(500).json({
      status: 500,
      mensaje: '❌ No se pudo generar la imagen',
      creator: 'Ado ( Wirk )'
    })
  }
})

app.listen(3000, () => {
  console.log('✅ API de imágenes corriendo en http://localhost:3000/api/imggen?prompt=algo')
})
