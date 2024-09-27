const apiUrl = 'https://proyecto-final-backend-z3fv.onrender.com'; 

$(document).ready(function() {
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

                // Ahora, crear el carrito una vez que el usuario esté logueado
                createCart(response.token)
                  .then(() => {
                      // Redirigir a la raíz de la web solo después de crear el carrito
                      window.location.href = response.redirectTo;
                      console.log('Redirigiendo a - Log de /src/Public/js/login.js:', response.redirectTo);
                  })
                  .catch(err => {
                      console.error('Error al crear el carrito después del login - Log de /src/Public/js/login.js:', err);
                      Swal.fire('Error', 'No se pudo crear el carrito1 - Log de /src/Public/js/login.js', 'error');
                  });
            } else {
                console.error('Error en el login - Log de /src/Public/js/login.js:', response.error);
                Swal.fire('Error', 'Usuario o contraseña incorrecta');
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error en el login - Log de /src/Public/js/login.js:', textStatus, errorThrown);
            Swal.fire('Usuario o contraseña incorrecta');
        }
    });
}

// Función para crear el carrito
function createCart(token) {
    console.log("Creando carrito con token - Log de /src/Public/js/login.js:", token);
    return new Promise((resolve, reject) => {
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
                    resolve();  // Resuelve la promesa cuando el carrito es creado
                } else {
                    console.error('Error al crear el carrito1 - Log de /src/Public/js/login.js:', response);
                    reject('No se pudo crear el carrito2');
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error al crear el carrito2 - Log de /src/Public/js/login.js:', textStatus, errorThrown);
                reject('Error en la petición del carrito');
            }
        });
    });
}