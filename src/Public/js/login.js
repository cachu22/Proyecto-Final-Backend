const apiUrl = 'http://localhost:8000';  

$(document).ready(function() {
    // Crear un carrito en caso de que no exista y el usuario esté logueado
    const token = localStorage.getItem('token');
    if (!localStorage.getItem('cartId') && token) {
        createCart(token);
    }

    // Manejar el envío del formulario de login
    $('#loginForm').submit(function(event) {
        event.preventDefault();
        const email = $('#email').val();
        const password = $('#password').val();
        console.log("Formulario de login enviado con email - Log de /src/Public/js/login.js:", email);
        login(email, password);
    });
});

// Función para manejar el login
function login(email, password) {
    console.log("Iniciando login con email - Log de /src/Public/js/login.js:", email);
    $.ajax({
        url: '/api/sessions/login',
        method: 'POST',
        data: { email, password },
        success: function(response) {
            console.log("Respuesta del servidor al hacer login - Log de /src/Public/js/login.js:", response);
            if (response.status === 'success') {
                // Almacenar el token en el almacenamiento local
                localStorage.setItem('token', response.token);
                console.log('Token almacenado en localStorage - Log de /src/Public/js/login.js:', response.token);

                // Crear el carrito una vez que el usuario esté logueado
                createCart(response.token);

                // Redirigir a la raíz de la web
                window.location.href = response.redirectTo;
                console.log('Redirigiendo a - Log de /src/Public/js/login.js:', response.redirectTo);
            } else {
                console.error('Error en el login - Log de /src/Public/js/login.js:', response.error);
                alert('Error: ' + response.error);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error en el login - Log de /src/Public/js/login.js:', textStatus, errorThrown);
            Swal.fire('Usuario o contraseña incorrecta');
        }
    });
}

function createCart(token) {
    console.log("Creando carrito con token - Log de /src/Public/js/login.js:", token);
    $.ajax({
        url: `${apiUrl}/api/cartsDB`,
        method: 'POST',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${token}` // Enviar el token en el encabezado
        },
        success: function(response) {
            console.log('Respuesta del servidor al crear el carrito - Log de /src/Public/js/login.js:', response);
            if (response && response.payload && response.payload.id) {
                // Guarda el ID del carrito en el almacenamiento local
                localStorage.setItem('cartId', response.payload.id);
                console.log('Carrito creado con ID - Log de /src/Public/js/login.js:', response.payload.id);
            } else {
                console.error('Error al crear el carrito - Log de /src/Public/js/login.js:', response);
                Swal.fire('Error', 'No se pudo crear el carrito - Log de /src/Public/js/login.js', 'error');
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error al crear el carrito - Log de /src/Public/js/login.js:', textStatus, errorThrown);
            Swal.fire('Error', 'No se pudo crear el carrito - Log de /src/Public/js/login.js', 'error');
        }
    });
}