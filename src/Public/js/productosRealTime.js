let products = [];

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const liveProducts = document.getElementById('liveProducts');
    const addProductForm = document.getElementById('addProductForm');

    // Manejar el evento 'codeExists' para mostrar un mensaje de error si el código ya existe
    socket.on('codeExists', (data) => {
        const errorMessageElement = document.getElementById('codeErrorMessage');
        errorMessageElement.textContent = data.message;

        // Mostrar el mensaje de error
        document.getElementById('codeError').innerHTML = errorMessageElement.outerHTML;
        // Mostrar un alert indicando que el código ya existe
        alert(data.message);
        // Agregar un mensaje de registro (log) en la consola del navegador
        console.log('El código ya existe - Log de /src/Public/js/productosRealTime.js:', data.code);
    });

    // Manejar el evento 'productAdded' para agregar una nueva tarjeta de producto
    socket.on('productAdded', (newProduct) => {
        const productHtml = `
            <div class="card-servicios">
                <img src="${newProduct.thumbnails}" alt="Imagen">
                <p>${newProduct.title}</p>
                <p>Precio: ${newProduct.price}</p>
                <p>Descripción: ${newProduct.description}</p>
                <p>Stock: ${newProduct.stock}</p>
                <!-- Botón para eliminar el producto -->
                <button class="eliminar-producto" data-product-id="${newProduct.id}">Eliminar</button>
            </div>
        `;

        // Agregar la nueva tarjeta de producto al contenedor
        liveProducts.insertAdjacentHTML('beforeend', productHtml);

        // Limpiar el formulario después de enviarlo
        addProductForm.reset();
        console.log('Producto añadido - Log de /src/Public/js/productosRealTime.js:', newProduct);
    });

    // Manejar el envío del formulario de agregar producto
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtener los datos del formulario y convertirlos a un objeto JavaScript
        const formData = new FormData(addProductForm);
        const productData = {};
        for (const [key, value] of formData.entries()) {
            productData[key] = value;
        }

        // Emitir un evento al servidor con los datos del producto
        console.log('Enviando datos del producto al servidor - Log de /src/Public/js/productosRealTime.js:', productData);
        socket.emit('addProduct', productData);
    });

    // Actualizar el manejador de eventos clic a los botones "Eliminar"
    liveProducts.addEventListener('click', (e) => {
        if (e.target.classList.contains('eliminar-producto')) {
            // Obtener el ID del producto a eliminar
            const productId = e.target.getAttribute('data-product-id');
            // Enviar una solicitud al servidor para eliminar el producto
            fetch(`/api/products/${productId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    // Si la eliminación es exitosa, emitir evento al servidor
                    socket.emit('eliminarProducto', productId);
                    console.log('Producto eliminado:', productId);
                } else {
                    console.error('Error al eliminar el producto');
                }
            })
            .catch(error => {
                console.error('Error al eliminar el producto - Log de /src/Public/js/productosRealTime.js:', error);
            });
        }
    });

    // Escuchar el evento 'productoEliminado' del servidor
    socket.on('productoEliminado', (productId) => {
        // Filtrar los productos en el cliente para eliminar el producto con el ID recibido
        products = products.filter(product => product.id !== productId);
        console.log('Producto eliminado del cliente - Log de /src/Public/js/productosRealTime.js:', productId);
        renderProducts(); // Volver a renderizar los productos
    });

    // Escuchar el evento 'productosActualizados' del servidor
    socket.on('productosActualizados', (updatedProducts) => {
        // Actualizar la lista de productos con los nuevos datos recibidos
        products = updatedProducts;
        console.log('Productos actualizados - Log de /src/Public/js/productosRealTime.js:', updatedProducts);
        renderProducts(); // Volver a renderizar los productos
    });

    // Función para renderizar los productos en la interfaz de usuario
    function renderProducts() {
        // Limpiar la lista de productos
        liveProducts.innerHTML = '';

        // Renderizar cada producto en la lista
        products.forEach(product => {
            const productHtml = `
                <div class="card-servicios">
                    <img src="${product.thumbnails}" alt="Imagen">
                    <p>${product.title}</p>
                    <p>Precio: ${product.price}</p>
                    <p>Descripción: ${product.description}</p>
                    <p>Stock: ${product.stock}</p>
                    <button class="eliminar-producto" data-product-id="${product.id}">Eliminar</button>
                </div>
            `;
            liveProducts.insertAdjacentHTML('beforeend', productHtml);
        });
    }
});