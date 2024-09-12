const apiUrl = 'http://localhost:8000';  
const token = localStorage.getItem('token');

const socket = io(apiUrl, { 
    transports: ['websocket'],
    query: { token: localStorage.getItem('token') }
});

let products = [];

document.addEventListener('DOMContentLoaded', () => {
    const liveProducts = document.getElementById('liveProducts');
    const addProductForm = document.getElementById('productForm');
    const token = localStorage.getItem('token');

    // Manejar eventos de WebSocket
    socket.on('connect', () => {
        console.log('Conectado al servidor WebSocket');
    });

    socket.on('connect_error', (error) => {
        console.error('Error de conexión WebSocket:', error);
    });

    socket.on('codeExists', (data) => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.message,
        });
        console.log('El código ya existe - Log de /src/Public/js/productosRealTime.js:', data.code);
    });

    socket.on('productAdded', (newProduct) => {
        renderProduct(newProduct);
        addProductForm.reset();
        console.log('Producto añadido - Log de /src/Public/js/productosRealTime.js:', newProduct);
    });

    socket.on('eliminarProducto', (pid) => {
        products = products.filter(product => product.id !== pid);
        console.log('Producto eliminado del cliente - Log de /src/Public/js/productosRealTime.js:', pid);
        renderProducts();
    });

    socket.on('productosActualizados', (updatedProducts) => {
        products = updatedProducts;
        console.log('Productos actualizados - Log de /src/Public/js/productosRealTime.js:', updatedProducts);
        renderProducts();
    });

    // Escucha el evento 'productosActualizados' y actualiza la interfaz de usuario
    socket.on('productosActualizados', (updatedProducts) => {
        renderProducts(updatedProducts);
    });

    // Función para renderizar un producto en la interfaz
    function renderProduct(product) {
        const productHtml = `
            <div class="card-servicios">
                <img src="${product.thumbnails}" alt="Imagen">
                <p>${product.title}</p>
                <p>Precio: ${product.price}</p>
                <p>Descripción: ${product.description}</p>
                <p>Stock: ${product.stock}</p>
                <button class="eliminar-producto" data-product-id="${product._id}">Eliminar</button>
            </div>
        `;
        liveProducts.insertAdjacentHTML('beforeend', productHtml);
    }

    // Función para renderizar los productos en la interfaz
    function renderProducts() {
        liveProducts.innerHTML = '';
        products.forEach(renderProduct);
    }

    // Manejar el envío del formulario de agregar producto
    addProductForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(addProductForm);
        const productData = Object.fromEntries(formData.entries());

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se encontró el token de autenticación.',
                });
                return;
            }

            // Enviar solicitud para añadir producto vía API
            const response = await fetch(`${apiUrl}/api/mgProducts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });

            const result = await response.json();
            if (response.ok) {
                // Emitir evento 'addProduct' al servidor a través de WebSocket
                socket.emit('addProduct', result.payload);
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
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.error || 'Verificar campos',
                });
            }
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al enviar el formulario',
            });
        }
    });

    // Manejar la eliminación de productos en tiempo real
    liveProducts.addEventListener('click', (e) => {
        if (e.target.classList.contains('eliminar-producto')) {
            const pid = e.target.getAttribute('data-product-id');
            const token = localStorage.getItem('token');

            if (pid && token) {
                fetch(`${apiUrl}/api/mgProducts/${pid}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(response => {
                    console.log('Estado de la respuesta:', response.status);
                    return response.json(); // Asegúrate de que la respuesta sea JSON
                })
                .then(data => {
                    console.log('Respuesta del servidor:', data);
                    if (data.status === 'success') {
                        socket.emit('eliminarProducto', pid);
                        console.log('Producto eliminado:', pid);
                    } else {
                        console.error('Error al eliminar el producto:', data.message);
                    }
                })
                .catch(error => {
                    console.error('Error al eliminar el producto - Log de /src/Public/js/productosRealTime.js:', error);
                });
            } else {
                console.error('ID del producto o token no encontrado');
            }
        }
    });
}); 