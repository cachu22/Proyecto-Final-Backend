const apiUrl = 'http://localhost:8000';  

document.getElementById('productForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const token = localStorage.getItem('token');
        console.log('El token encontrado es', token);

        if (!token) {
            alert('No se encontró el token de autenticación.');
            return;
        }

        // Usa `apiUrl` para construir la URL completa del endpoint
        const response = await fetch(`${apiUrl}/api/mgProducts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('el resultado de gestionProductos', result);

        if (response.ok) {
            alert('Producto creado exitosamente');
        } else {
            if (result.message === 'Faltan campos requeridos') {
                alert('Error: Faltan campos requeridos. Por favor, complete todos los campos.');
            } else {
                alert(`Error: ${result.message}`);
            }
        }
    } catch (error) {
        console.error('Error al enviar el formulario:', error);
    }
});