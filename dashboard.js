document.addEventListener('DOMContentLoaded', () => {
    const apiCards = document.querySelectorAll('.api-card');

    // Inicializar los ejemplos de uso y los botones de copiar
    apiCards.forEach(card => {
        const endpoint = card.dataset.endpoint;
        const paramName = card.dataset.param;
        const usageCode = card.querySelector('.usage-box code');
        const copyBtn = card.querySelector('.copy-btn');

        // Establecer el texto inicial
        usageCode.textContent = `/api/${endpoint}?${paramName}=...`;

        // Lógica para el botón de copiar
        copyBtn.addEventListener('click', () => {
            // Cambiar el texto inmediatamente para una respuesta visual rápida
            copyBtn.textContent = '¡Copiado!';
            setTimeout(() => {
                copyBtn.textContent = 'Copiar';
            }, 2000);

            // Realizar la operación de copiado
            navigator.clipboard.writeText(location.origin + usageCode.textContent).catch(err => {
                console.error('Error al copiar:', err);
                // Opcional: manejar el error visualmente si es necesario
            });
        });
    });

    // Lógica para los formularios
    apiCards.forEach(card => {
        const form = card.querySelector('form');
        const resultArea = card.querySelector('.result-area');
        const usageCode = card.querySelector('.usage-box code');

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const endpoint = card.dataset.endpoint;
            const paramName = card.dataset.param;
            const responseType = card.dataset.responseType;
            const input = form.querySelector('input[type="text"]');
            const inputValue = input.value.trim();

            if (!inputValue) {
                resultArea.innerHTML = '<p style="color: red;">Por favor, introduce un valor.</p>';
                return;
            }

            // Actualizar dinámicamente el ejemplo de uso
            const apiUrl = `/api/${endpoint}?${paramName}=${encodeURIComponent(inputValue)}`;
            usageCode.textContent = apiUrl;

            resultArea.innerHTML = '<p>Cargando...</p>';

            try {
                if (responseType === 'json') {
                    const response = await fetch(apiUrl);
                    if (!response.ok) {
                        throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
                    }
                    const data = await response.json();
                    resultArea.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
                } else if (responseType === 'image') {
                    resultArea.innerHTML = `<img src="${apiUrl}" alt="Resultado de la API">`;
                } else if (responseType === 'video') {
                    resultArea.innerHTML = `<video controls src="${apiUrl}" width="100%"></video>`;
                } else if (responseType === 'audio') {
                    resultArea.innerHTML = `<audio controls src="${apiUrl}"></audio>`;
                }
            } catch (error) {
                console.error('Error al llamar a la API:', error);
                resultArea.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
            }
        });
    });
});
