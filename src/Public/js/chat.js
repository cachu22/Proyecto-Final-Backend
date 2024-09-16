// Obtener el rol del usuario desde localStorage
const userRole = localStorage.getItem('role');
const token = localStorage.getItem('token');

// Función para verificar si el chat debe estar visible
function shouldDisplayChat() {
    // Verificar si el usuario tiene un token (está autenticado) y no es un administrador
    return token && userRole !== 'admin';
}

// Mostrar u ocultar el chat según el rol del usuario
const chatBox = document.querySelector('#chatBox');
if (shouldDisplayChat()) {
    chatBox.style.display = 'block'; // Mostrar el chat
} else {
    chatBox.style.display = 'none'; // Ocultar el chat
}

// Inicializar el socket.io
const apiUrl = 'https://proyecto-final-backend-z3fv.onrender.com';
const socket = io(apiUrl, { 
    transports: ['websocket'],
    query: { token: localStorage.getItem('token') }
});
let user;

// Verificar si el usuario ya está almacenado en localStorage
if (localStorage.getItem('user')) {
    user = localStorage.getItem('user');
    console.log(`Usuario recuperado - Log de src/Public/js/chat.js: ${user}`);
} else {
    // Mostrar un cuadro de diálogo para que el usuario ingrese su email
    Swal.fire({
        title: 'Bienvenidos',
        input: 'email',
        text: 'Indique su email',
        icon: 'success',
        inputValidator: value => {
            return !value && 'Necesitas escribir tu email para continuar';
        },
        allowOutsideClick: false
    }).then(result => {
        if (result.value) {
            user = result.value;
            console.log(`Usuario ingresado - Log de src/Public/js/chat.js: ${user}`);
            localStorage.setItem('user', user); // Guardar el usuario en localStorage
        }
    });
}

// Obtener elementos del chat
const chatInput = document.querySelector('#chatInput');
const chatSendBtn = document.querySelector('#chatSendBtn');
const chatMessages = document.querySelector('#chatMessages'); // Obtener el contenedor de mensajes del chat

// Agregar oyentes
chatInput.addEventListener('keyup', evt => {
    if (evt.key === 'Enter') {
        sendMessage();
    }
});

// Función para enviar mensajes al servidor y mostrarlos en el cliente
function sendMessage() {
    const message = chatInput.value.trim();
    if (message.length > 0 && user) {
        // Enviar el mensaje al servidor para guardarlo en la base de datos
        fetch('/save-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user, message })
        })
        .then(response => {
            if (response.ok) {
                console.log('Mensaje enviado al servidor - Log de src/Public/js/chat.js');
                // Enviar el mensaje al servidor para transmitirlo en tiempo real a todos los clientes
                socket.emit('message', { user, message });
                chatInput.value = ''; // Limpiar el campo de entrada después de enviar el mensaje
            } else {
                console.log('Error al enviar el mensaje al servidor - Log de src/Public/js/chat.js');
            }
        })
        .catch(error => {
            console.log('Error al enviar el mensaje - Log de src/Public/js/chat.js:', error);
        });
    } else {
        console.log('Mensaje o usuario inválido - Log de src/Public/js/chat.js');
    }
}

// Función para agregar mensajes al contenedor de mensajes del chat, mostrando los más recientes en la parte superior
function appendMessageToUI(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatMessages.insertAdjacentElement('afterbegin', messageElement); // Inserta el mensaje al principio del contenedor de mensajes
}

// Manejar los mensajes recibidos del servidor y mostrarlos en el cliente
socket.on('message', ({ user, message }) => {
    if (user && message) {
        appendMessageToUI(`${user}: ${message}`);
        console.log(`Mensaje recibido de ${user} - Log de src/Public/js/chat.js: ${message}`);
    } else {
        console.error('Mensaje recibido del servidor es inválido - Log de src/Public/js/chat.js:', { user, message });
    }
});

// Enviar mensaje cuando se hace clic en el botón de enviar
chatSendBtn.addEventListener('click', sendMessage);