const apiUrl = 'https://proyecto-final-backend-z3fv.onrender.com';

function getUserInfo() {
    const token = localStorage.getItem('token');
    console.log('log de current.js - getUserInfo - token - Log de src/Public/js/current.js', token);

    if (!token) {
        console.log('No token found - Log de src/Public/js/current.js');
        return;
    }

    // Decodificar el token JWT para obtener el ID del usuario
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.id;

    $.ajax({
        url: `${apiUrl}/api/sessions/current`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function(userData) {
            if (userData && userData.status === 'success' && userData.payload) {
                console.log('Datos del usuario obtenidos - Log de src/Public/js/current.js:', userData.payload);
                const isLoggedIn = true;

                // Actualizar el contenido del HTML con los datos del usuario
                $('#user-fullname').text(userData.payload.fullname || 'Nombre no disponible');
                $('#user-email').text(userData.payload.email || 'Email no disponible');
                $('#user-rol').text(userData.payload.role || 'Rol no disponible');

            } else {
                console.log('Usuario no está logueado o datos no válidos - Log de src/Public/js/current.js:', userData);
                const isLoggedIn = false;
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('Error al obtener datos del usuario - Log de src/Public/js/current.js:', textStatus, errorThrown);
            console.log('Respuesta completa del error - Log de src/Public/js/current.js:', jqXHR.responseText);
        }
    });
}

// Llamar a getUserInfo para obtener la información del usuario si ya está logueado
getUserInfo();