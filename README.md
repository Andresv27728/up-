# Yo Soy Yo API

Esta es una API simple creada con Node.js y Express. Puede ser desplegada en plataformas como Vercel o Render.

## Rutas Disponibles

La API expone las siguientes rutas:

- `/api/ytmp4?url=<URL_de_YouTube>`: Convierte un video de YouTube a MP4.
- `/api/hd?url=<URL_de_imagen>`: Mejora la calidad de una imagen.
- `/api/tiktok?url=<URL_de_TikTok>`: Descarga un video de TikTok.
- `/api/pinterest?q=<termino_de_busqueda>`: Busca imágenes en Pinterest.
- `/api/pinvid?q=<termino_de_busqueda>`: Busca videos en Pinterest.
- `/api/youtube?q=<termino_de_busqueda>`: Busca videos en YouTube.
- `/api/ytmp3?url=<URL_de_YouTube>`: Convierte un video de YouTube a MP3.
- `/api/adonix`: Endpoint de prueba para Adonix.
- `/api/adonixvoz`: Endpoint de prueba para Adonix Voz.
- `/api/IAimagen`: Endpoint de prueba para IA Imagen.
- `/api/Extract`: Endpoint de prueba para Extract.

## Despliegue en Vercel

Vercel está diseñado para funcionar sin configuración para proyectos como este. Desplegará automáticamente las funciones que se encuentran en el directorio `api`.

1.  **Haz un fork de este repositorio.**
2.  **Ve a [Vercel](https://vercel.com/new).**
3.  **Conecta tu cuenta de GitHub e importa el repositorio que acabas de bifurcar.**
4.  **Vercel detectará automáticamente que es un proyecto de Node.js.** No necesitas cambiar ninguna configuración.
5.  **Haz clic en "Deploy".**

¡Y eso es todo! Vercel desplegará tu API y te proporcionará una URL.

## Despliegue en Render

Render te permite desplegar este proyecto como un servicio web.

1.  **Haz un fork de este repositorio.**
2.  **Ve a [Render](https://dashboard.render.com/new/web).**
3.  **Conecta tu cuenta de GitHub y selecciona el repositorio que acabas de bifurcar.**
4.  **Completa la configuración del servicio web:**
    *   **Nombre:** Elige un nombre único para tu servicio.
    *   **Runtime:** `Node`
    *   **Comando de Build:** `npm install`
    *   **Comando de Inicio:** `node index.js`
    *   **Versión de Node:** `20` o superior.
5.  **Haz clic en "Crear Servicio Web".**

Render instalará las dependencias y iniciará el servidor. Una vez completado, tu API estará disponible en la URL proporcionada.

## Desarrollo Local

Si prefieres ejecutar el proyecto en tu máquina local, sigue estos pasos:

1.  **Clona el repositorio:**
    ```bash
    git clone <URL_del_repositorio>
    cd <nombre_del_directorio>
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Inicia el servidor:**
    ```bash
    npm start
    ```

El servidor se iniciará en `http://localhost:3000`.
