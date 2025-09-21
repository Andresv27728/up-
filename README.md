# Yo Soy Yo API

Esta es una API simple creada con Node.js y Express. Puede ser desplegada en plataformas como Vercel o Render.

## Rutas Disponibles

La API expone las siguientes rutas:

- `/api/ytmp4?url=<URL_de_YouTube>`: Convierte un video de YouTube a MP4.
- `/api/ytmp3?url=<URL_de_YouTube>`: Convierte un video de YouTube a MP3.
- `/api/hd?url=<URL_de_imagen>`: Mejora la calidad de una imagen.
- `/api/tiktok?url=<URL_de_TikTok>`: Descarga un video de TikTok.
- `/api/pinterest?q=<termino_de_busqueda>`: Busca imágenes en Pinterest.
- `/api/pinvid?q=<termino_de_busqueda>`: Busca videos en Pinterest.
- `/api/youtube?q=<termino_de_busqueda>`: Busca videos en YouTube.
- `/api/adonix`: Endpoint de prueba para Adonix.
- `/api/adonixvoz`: Endpoint de prueba para Adonix Voz.
- `/api/IAimagen`: Endpoint de prueba para IA Imagen.
- `/api/Extract`: Endpoint de prueba para Extract.

## Despliegue en Vercel

Vercel puede desplegar este proyecto, pero está optimizado para funciones "serverless". Dado que este proyecto ahora se ejecuta como un único servidor Express, **Render es la plataforma recomendada.**

Si aún así deseas usar Vercel, necesitarás un archivo `vercel.json` para indicarle a Vercel que trate el proyecto como un único servidor.

**`vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```

## Despliegue en Render (Recomendado)

Render es ideal para desplegar este proyecto como un servicio web.

1.  **Haz un fork de este repositorio.**
2.  **Ve a [Render](https://dashboard.render.com/new/web).**
3.  **Conecta tu cuenta de GitHub y selecciona el repositorio que acabas de bifurcar.**
4.  **Render detectará automáticamente la configuración de Node.js.** Asegúrate de que los campos estén correctos:
    *   **Runtime:** `Node`
    *   **Comando de Build:** `npm install`
    *   **Comando de Inicio:** `node index.js`
5.  **Haz clic en "Crear Servicio Web".**

Render instalará las dependencias y iniciará el servidor. Una vez completado, tu API y el dashboard estarán disponibles en la URL proporcionada.

## Desarrollo Local

Si prefieres ejecutar el proyecto en tu máquina local, sigue estos pasos:

1.  **Clona el repositorio.**
2.  **Navega al directorio del proyecto.**
3.  **Instala las dependencias:**
    ```bash
    npm install
    ```
4.  **Inicia el servidor:**
    ```bash
    npm start
    ```

El servidor se iniciará en `http://localhost:3000`.
