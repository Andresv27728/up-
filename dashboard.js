document.addEventListener('DOMContentLoaded', () => {
    const apiCards = document.querySelectorAll('.api-card');

    apiCards.forEach(card => {
        const form = card.querySelector('form');
        const resultArea = card.querySelector('.result-area');

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

            resultArea.innerHTML = '<p>Cargando...</p>';

            const apiUrl = `/api/${endpoint}?${paramName}=${encodeURIComponent(inputValue)}`;

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
