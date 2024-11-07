// Definir la URL base de tu API
const apiUrl = 'https://proyecto-final-backend-z3fv.onrender.com';

// Conectar al servidor Socket.IO
const token = localStorage.getItem('token');

if (token) {
    const socket = io(apiUrl, { 
        transports: ['websocket'],
        query: { token: localStorage.getItem('token') }
    });

    // Manejo de eventos de socket
    socket.on('connect', () => {
        console.log('Conectado al servidor Socket.IO');
    });

    // socket.on('chatMessage', (message) => {
    //     const chatMessages = document.getElementById('chatMessages');
    //     const messageElement = document.createElement('div');
    //     messageElement.textContent = message.text; // Asegúrate de que `message` tenga la propiedad `text`
    //     chatMessages.appendChild(messageElement);
    // });

    socket.on('chatMessage', ({ user, message }) => {
        if (user && message) {
            appendMessageToUI(`${user}: ${message}`);
            console.log(`Mensaje recibido de ${user} - Log de src/Public/js/chat.js: ${message}`);
        } else {
            console.error('Mensaje recibido del servidor es inválido - Log de src/Public/js/chat.js:', { user, message });
        }
    });

    socket.on('error', (error) => {
        console.error('Error recibido:', error);
        Swal.fire('Error', 'Se produjo un error con la conexión al servidor de sockets', 'error');
    });

    socket.on('disconnect', () => {
        console.log('Desconectado del servidor Socket.IO');
    });

    // Función para enviar un mensaje al servidor
    function sendMessage(message) {
        if (message) {
            socket.emit('message', { text: message });
            console.log('Mensaje enviado:', message);
        } else {
            console.error('No se puede enviar un mensaje vacío.');
        }
    }

    // Ejemplo de llamada a la función para enviar un mensaje
    sendMessage('Bienvenidos al chat!!');
}

// Función para agregar un producto al carrito
function addToCart(pid) {
    console.log("Añadiendo producto al carrito - Log de /src/Public/js/producto.js:", pid);

    // Verifica si pid es válido
    if (!pid) {
        console.error('ID del producto inválido - Log de /src/Public/js/producto.js.');
        Swal.fire('Error', 'ID del producto inválido.', 'error');
        return;
    }

    // Obtener el ID del carrito del almacenamiento local
    const cartId = localStorage.getItem('cartId');
    console.log("ID del carrito - Log de /src/Public/js/producto.js:", cartId);

    if (!cartId) {
        console.error('No se encontró el ID del carrito - Log de /src/Public/js/producto.js.');
        Swal.fire('Error', 'Debes loguearte para añadir productos', 'error');
        return;
    }

    // Obtener el token del almacenamiento local
    const token = localStorage.getItem('token');
    console.log("Token - Log de /src/Public/js/producto.js:", token);

    const data = { quantity: 1 };
    console.log("Datos enviados - Log de /src/Public/js/producto.js:", data);

    $.ajax({
        url: `${apiUrl}/api/cartsDB/${cartId}/product/${pid}`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function(response) {
            console.log("Respuesta del servidor - Log de /src/Public/js/producto.js:", response);

            if (response && response.status === 'success') {
                Swal.fire('Éxito', 'Producto agregado al carrito', 'success');
            } else {
                console.error('Error al agregar al carrito - Log de /src/Public/js/producto.js:', response);
                Swal.fire('Error', 'No se pudo agregar el producto al carrito', 'error');
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error al agregar al carrito - Log de /src/Public/js/producto.js:', textStatus, errorThrown);
            Swal.fire('Error', 'No se pudo agregar el producto al carrito - Verifica tu sesión', 'error');
        }
    });
}

// Obtener productos
$.ajax({
    url: `${apiUrl}/api/mgProducts/products`,
    method: 'GET',
    success: function(data) {
        console.log('mgProducts - Log de /src/Public/js/producto.js:', data);

        if (Array.isArray(data.payload.docs)) {
            data.payload.docs.forEach(function(product) {
                // Verificar y usar valores predeterminados si las propiedades no están definidas
                const thumbnails = product.thumbnails || 'default-thumbnail.jpg';
                const productCard = `
                    <div class="card-servicios">
                        <img src="${thumbnails}" alt="Imagen">
                        <p>${product.title || 'Título no disponible'}</p>
                        <p>Precio: ${product.price || 'Precio no disponible'}</p>
                        <p>Descripción: ${product.description || 'Descripción no disponible'}</p>
                        <p>Stock: ${product.stock || 'Stock no disponible'}</p>
                        <button class="add-to-cart-btn" data-product-id="${product._id}">Agregar al carrito</button>
                        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#productModal" data-product-id="${product._id}">Detalles</button>
                    </div>
                `;
            });

            // Asignar el evento click a los botones "Agregar al carrito" en la vista de tarjetas
            $(document).on('click', '.add-to-cart-btn', function() {
                console.log("Botón 'Agregar al carrito' clicado desde la tarjeta - Log de /src/Public/js/producto.js");
                let pid = $(this).data('product-id');
                addToCart(pid);
            });

            // Asignar el evento click a los botones en el modal
            $(document).on('click', '.btn-primary', function() {
                let pid = $(this).data('product-id');
                console.log("Button clicked. Product ID - Log de /src/Public/js/producto.js:", pid);

                $.ajax({
                    url: `${apiUrl}/api/mgProducts/${pid}`,
                    method: 'GET',
                    success: function(response) {
                        console.log("Product details received - Log de /src/Public/js/producto.js:", response);
                        if (response.status === 'success') {
                            let product = response.payload;
                            console.log("Product details - Log de /src/Public/js/producto.js:", product);
                            let modalBody = $('#productModal .modal-body');
                            modalBody.empty();

                            // Verificar y usar valores predeterminados si las propiedades no están definidas
                            const thumbnails = product.thumbnails || 'default-thumbnail.jpg';
                            let productDetails = `
                                <div class="card-servicios">
                                    <img src="${thumbnails}" alt="Imagen">
                                </div>
                                <div>
                                    <p>${product.title || 'Título no disponible'}</p>
                                    <p>Modelo: ${product.model || 'Modelo no disponible'}</p>
                                    <p>Precio: ${product.price || 'Precio no disponible'}</p>
                                    <p>Descripción: ${product.description || 'Descripción no disponible'}</p>
                                    <p>Codigo: ${product.code || 'Código no disponible'}</p>
                                    <p>Categoria: ${product.category || 'Categoría no disponible'}</p>
                                    <p>Disponibilidad: ${product.availability || 'Disponibilidad no disponible'}</p>
                                    <p>Stock: ${product.stock || 'Stock no disponible'}</p>
                                    <p>ID: ${product._id || 'ID no disponible'}</p>
                                    <button class="add-to-cart-btn" data-product-id="${product._id}">Agregar al carrito</button>
                                </div>`;
                            modalBody.html(productDetails);
                        } else {
                            console.error('Error al cargar el producto - Log de /src/Public/js/producto.js:', response.message);
                            Swal.fire('Error', 'No se pudo cargar el producto', 'error');
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.error('Error al cargar el producto - Log de /src/Public/js/producto.js:', textStatus, errorThrown);
                        Swal.fire('Error', 'No se pudo cargar el producto', 'error');
                    }
                });
            });
        } else {
            console.error('data.payload.docs no es un array - Log de /src/Public/js/producto.js:', data.payload.docs);
        }
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.error('Error al obtener la configuración del puerto - Log de /src/Public/js/producto.js:', textStatus, errorThrown);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si existe el cartId en localStorage
    const cartId = localStorage.getItem('cartId');
    
    if (cartId) {
        // Actualizar el href del enlace con el ID del carrito
        document.getElementById('cartLink').setAttribute('href', `/cart/${cartId}`);
    } else {
        // Si no hay carrito, deshabilitar el enlace o mostrar un mensaje
        document.getElementById('cartLink').addEventListener('click', function(event) {
            event.preventDefault();
            Swal.fire('No tienes un carrito creado todavía.');
        });
    }
});