// Define la URL base de la API
const apiUrl = 'http://localhost:8000';  

// Añade un evento de escucha para el envío del formulario
document.getElementById('productForm').addEventListener('submit', async (event) => {
    // Previene el comportamiento por defecto del formulario (evita que se recargue la página)
    event.preventDefault();

    // Obtiene el formulario que activó el evento
    const form = event.target;
    // Crea un objeto FormData a partir del formulario para manejar los datos de entrada
    const formData = new FormData(form);
    // Convierte los datos del formulario a un objeto JavaScript
    const data = Object.fromEntries(formData.entries());

    try {
        // Obtiene el token de autenticación almacenado en el localStorage
        const token = localStorage.getItem('token');
        console.log('El token encontrado es', token);

        // Si no se encuentra el token, muestra un mensaje de error usando SweetAlert2
        if (!token) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se encontró el token de autenticación.',
            });
            return; // Detiene la ejecución si no hay token
        }

        // Envía una solicitud POST al endpoint de la API para crear un nuevo producto
        const response = await fetch(`${apiUrl}/api/mgProducts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Indica que el cuerpo de la solicitud está en formato JSON
                'Authorization': `Bearer ${token}` // Incluye el token de autenticación en los encabezados
            },
            body: JSON.stringify(data) // Convierte el objeto de datos en una cadena JSON para el cuerpo de la solicitud
        });

        // Analiza la respuesta JSON de la API
        const result = await response.json();
        console.log('Resultado de la creación del producto:', result);

        // Muestra un SweetAlert2 dependiendo del estado de la respuesta
        if (response.ok) {
            // Si la respuesta es exitosa (código de estado 2xx), muestra un mensaje de éxito
            Swal.fire({
                icon: 'success',
                title: 'Producto creado exitosamente',
                html: `<strong>ID:</strong> ${result.payload.id}<br>
                       <strong>Title:</strong> ${result.payload.title}<br>
                       <strong>Description:</strong> ${result.payload.description}<br>
                       <strong>Price:</strong> ${result.payload.price}<br>
                       <strong>Code:</strong> ${result.payload.code}<br>
                       <strong>Stock:</strong> ${result.payload.stock}<br>
                       <strong>Category:</strong> ${result.payload.category}`
            });
        } else {
            // Si la respuesta no es exitosa, muestra un mensaje de error con el mensaje de la respuesta
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.error || 'Verificar campos',
            });
        }
    } catch (error) {
        // Captura cualquier error que ocurra durante el envío de la solicitud
        console.error('Error al enviar el formulario:', error);
        // Muestra un mensaje de error genérico en caso de fallo
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al enviar el formulario',
        });
    }
});