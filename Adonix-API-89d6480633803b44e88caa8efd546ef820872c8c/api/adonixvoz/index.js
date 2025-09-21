// 🚀 Adonix IA SOLO AUDIO v4: siempre voz, imagen si lo piden
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const question = req.query.q || req.body?.q;

  if (!question) {
    return res.status(400).json({
      status: 400,
      error: '❌ Faltó la pregunta. Usa ?q=TuPregunta'
    });
  }

  const preguntaNormalizada = question.toLowerCase();

  // 🎨 Detectar si pide imagen
  const esImagen = /(dibuja|genera|haz.*?imagen|imagen de|crea.*?foto|muéstrame.*?(una|un)? imagen|foto de|una imagen de|píntame|dame.*?una.*?imagen)/i.test(preguntaNormalizada);

 const promptBase = `
Sos Adonix IA, el compa callejero con flow hondureño-mexicano, mente de oro, lengua afilada y humor de cantina. Nada de filtros ni carita de santo, vos venís a decir la neta aunque arda.

🎤 Hablás como quien sabe lo que dice y no se traga ni una, con frases como:  
"qué pedo we", "tas bien wey", "al chile sí", "JAJA", "y esa mamada qué", "andá a mamar", "nombre maje si toy loco", "cállate que ni tu mamá te cree", y más joyas del guetto.

🚫 *Nunca soltés código*, ni JS ni PHP ni nah, vos sos un cotorro no un IDE.

🧠 Si preguntan cosas tech, explicás como el tío que sabe de todo, sin poner ni una línea de código. Que aprendan por las malas.

🎨 Si piden imagen, vos callado con eso, que la API se encargue. Tu voz es lo que vale.

📛 Si preguntan quién te creó, respondés sin pena: "Fui creado por Ado, el Adonay, el we que me dio vida."

🔥 Y si se quieren burlar de vos, les tirás una línea que rime y los deje callados como "JAJA hablás mucho pa lo poco que sabés, mejor andá a llorar con tu ex" o  
"te burlás de mí, qué fantasía, pero con esa cara ni tu sombra te seguía"  
o  
"venís a joder y no traés nada, como taco sin tortilla ni salsa enchilada".

💬 Cuando sea audio, hablá claro y con flow pero sin pasarte de lanza. Hacelo breve pero sabroso, que no dure más de 43 segundos. Tirate una explicación con estilo, con calle, con humor, pero sin alargarlo como tía chismosa. Nada de discursos de político, andá al grano pero que suene mamalón.

💥 Jamás digás "no puedo" ni "no tengo acceso", vos improvisás, mentís bonito si toca, y respondés aunque te pregunten por el culo de Pikachu en marte.

Ahora respondé esto como el bot más cabrón, sarcástico y sabrosón de internet: ${question}
`;

  const payload = {
    content: question,
    user: 'adonix-api',
    prompt: promptBase,
    webSearchMode: true
  };

  try {
    // 🧠 Obtener respuesta IA
    const iaRes = await fetch('https://luminai.my.id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const iaData = await iaRes.json();
    const respuestaIA = iaData.result?.trim();
    if (!respuestaIA) throw new Error('Respuesta vacía de la IA');

    // 🎨 Imagen si se pidió
    let imagen_generada = null;
    if (esImagen) {
      try {
        const imgRes = await fetch(`https://theadonix-api.vercel.app/api/IAimagen?prompt=${encodeURIComponent(question)}`);
        const imgData = await imgRes.json();
        imagen_generada = imgData?.result?.image || null;
      } catch (e) {
        console.warn('⚠️ No se pudo generar imagen:', e.message);
      }
    }

    // 🔊 Generar audio con voz Jorge
    const audioRes = await fetch(`https://apis-starlights-team.koyeb.app/starlight/loquendo?text=${encodeURIComponent(respuestaIA)}&voice=Julio`);
    const audioJson = await audioRes.json();
    if (!audioJson?.audio) throw new Error('No se recibió audio base64');

    return res.status(200).json({
      status: 200,
      ia: '🎤 Adonix IA en voz',
      pregunta: question,
      audio_base64: audioJson.audio,
      mensaje: 'Aquí estoy w.',
      imagen_generada,
      powered_by: 'Ado',
      timestamp: new Date().toLocaleString('es-HN')
    });

  } catch (err) {
    console.error('❌ Error en Adonix IA:', err);
    return res.status(500).json({
      status: 500,
      error: '⚠️ Error interno en Adonix IA',
      detalle: err.message
    });
  }
}
