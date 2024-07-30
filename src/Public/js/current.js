import { logger } from "../../utils/logger.js";

const apiUrl = 'http://localhost:8000';

function getUserInfo() {
    const token = localStorage.getItem('token');
    logger.info('log de current.js - getUserInfo - token - Log de src/Public/js/current.js', token);

    if (!token) {
        logger.warn('No token found - Log de src/Public/js/current.js');
        return;
    }

    // Decodificar el token JWT para obtener el ID del usuario
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.id;

    $.ajax({
        url: `${apiUrl}/api/usersDB/user-info/${userId}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}` // Enviar el token en el encabezado
        },
        success: function(userData) {
            if (userData && userData.status === 'success' && userData.payload) {
                logger.info('Datos del usuario obtenidos - Log de src/Public/js/current.js:', userData.payload);
                const isLoggedIn = true;

                // Actualizar el contenido del HTML con los datos del usuario
                $('#user-fullname').text(userData.payload.fullname || 'Nombre no disponible');
                $('#user-email').text(userData.payload.email || 'Email no disponible');
                // Agrega más campos según sea necesario

            } else {
                logger.warn('Usuario no está logueado o datos no válidos - Log de src/Public/js/current.js:', userData);
                const isLoggedIn = false;
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            logger.error('Error al obtener datos del usuario - Log de src/Public/js/current.js:', textStatus, errorThrown);
            logger.info('Respuesta completa del error - Log de src/Public/js/current.js:', jqXHR.responseText);
        }
    });
}

// Llamar a getUserInfo para obtener la información del usuario si ya está logueado
getUserInfo();