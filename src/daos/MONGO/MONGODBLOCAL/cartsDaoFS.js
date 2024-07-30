import fs from 'fs';
import { logger } from '../../../utils/logger.js';

class CartDaoFS {
    constructor(path) {
        this.path = path;
    }

    // Método para obtener todos los carritos
    getAllCarts() {
        const cartsData = this.getCartsFromFile();
        return cartsData.carts || []; // Asegúrate de manejar la posible estructura de datos
    }

    // Método para obtener los datos de los carritos desde el archivo
    getCartsFromFile() {
        if (!fs.existsSync(this.path)) {
            logger.info("El archivo de carritos no existe - Log de /src/daos/MONGO/MONGODBLOCAL/cartsDaoFS.js.");
            return []; // Si no existe el archivo, devuelve una lista vacía
        }
        const data = fs.readFileSync(this.path, 'utf8');
        if (!data.trim()) {
            logger.info("El archivo de carritos está vacío - Log de /src/daos/MONGO/MONGODBLOCAL/cartsDaoFS.js.");
            return []; // Si el archivo está vacío, devuelve una lista vacía
        }
        return JSON.parse(data);
    }

    // Método para crear un nuevo carrito
    createCart() {
        try {
            // Generar un ID único para el nuevo carrito
            const newCartId = this.generateUniqueCartId();

            // Crear un nuevo carrito con el ID generado y una lista vacía de productos
            const newCart = {
                "id de carrito": newCartId,
                products: []
            };

            // Obtener los carritos existentes
            const carts = this.getCartsFromFile();

            // Agregar el nuevo carrito al array de carritos
            carts.push(newCart);

            // Guardar los cambios en el archivo carts.json
            this.saveCartsToFile(carts);

            logger.info("Nuevo carrito creado - Log de /src/daos/MONGO/MONGODBLOCAL/cartsDaoFS.js:", newCart);
            return newCart;
        } catch (error) {
            logger.error("Error al crear el carrito - Log de /src/daos/MONGO/MONGODBLOCAL/cartsDaoFS.js:", error);
            throw error;
        }
    }

    // Método para generar un ID único para el nuevo carrito
    generateUniqueCartId() {
        try {
            const carts = this.getCartsFromFile();
            const existingIds = carts.map(cart => cart["id de carrito"]);
            const newId = Math.max(...existingIds, 0) + 1; // Incrementar el ID más alto en 1
            return newId;
        } catch (error) {
            logger.error("Error al generar un ID único para el carrito - Log de /src/daos/MONGO/MONGODBLOCAL/cartsDaoFS.js:", error);
            throw error;
        }
    }

    // Método para obtener un carrito por su ID
    getCartById(cartId) {
        try {
            const cartsData = this.getCartsFromFile();
            const cart = cartsData.find(cart => cart["id de carrito"] === cartId);
            return cart || null;
        } catch (error) {
            logger.error("Error al obtener el carrito por ID - Log de /src/daos/MONGO/MONGODBLOCAL/cartsDaoFS.js:", error);
            throw error;
        }
    }

    // Método para guardar los carritos en un archivo JSON
    saveCartsToFile(carts) {
        try {
            const cartsJSON = JSON.stringify(carts, null, 2);
            fs.writeFileSync(this.path, cartsJSON);
            logger.info("Carritos guardados en el archivo - Log de /src/daos/MONGO/MONGODBLOCAL/cartsDaoFS.js.");
        } catch (error) {
            logger.error("Error al guardar los carritos en el archivo - Log de /src/daos/MONGO/MONGODBLOCAL/cartsDaoFS.js:", error);
            throw error;
        }
    }

    // Leer el JSON de productos para traer información
    getProductsFromFile() {
        try {
            const productsData = fs.readFileSync('./src/file/products.json', 'utf-8');
            return JSON.parse(productsData);
        } catch (error) {
            logger.error('Error al leer el archivo de productos - Log de /src/daos/MONGO/MONGODBLOCAL/cartsDaoFS.js:', error);
            return [];
        }
    }

    // Método para agregar un producto al carrito
    async addProductToCart(cid, pid) {
        try {
            // Obtener los carritos y productos desde los archivos
            let carts = this.getCartsFromFile();
            let products = this.getProductsFromFile();

            // Buscar el producto por su ID
            const productToAdd = products.find(product => product.id === parseInt(pid));
            if (!productToAdd) {
                logger.warn(`Producto con ID ${pid} no encontrado - Log de /src/daos/MONGO/MONGODBLOCAL/cartsDaoFS.js.`);
                throw new Error(`Producto con ID ${pid} no encontrado.`);
            }

            // Buscar el carrito por su ID
            let cartIndex = carts.findIndex(cart => cart["id de carrito"] === parseInt(cid));

            // Si no se encontró el carrito, crear uno nuevo
            if (cartIndex === -1) {
                const newCart = {
                    "id de carrito": parseInt(cid),
                    products: [{
                        "id de producto": pid,
                        quantity: 1,
                        thumbnails: productToAdd.thumbnails, // Agregar la imagen del producto
                        price: productToAdd.price // Agregar el precio del producto
                    }]
                };
                carts.push(newCart); // Agregar el nuevo carrito a la lista de carritos
            } else {
                // Si el carrito ya existe, buscar el producto por su ID
                const existingProductIndex = carts[cartIndex].products.findIndex(item => item["id de producto"] === pid);
                if (existingProductIndex !== -1) {
                    // Si el producto ya está en el carrito, incrementar la cantidad
                    carts[cartIndex].products[existingProductIndex].quantity++;
                } else {
                    // Si el producto no está en el carrito, agregarlo con cantidad 1
                    carts[cartIndex].products.push({
                        "id de producto": pid,
                        quantity: 1,
                        thumbnails: productToAdd.thumbnails, // Agregar la imagen del producto
                        price: productToAdd.price // Agregar el precio del producto
                    });
                }
            }

            // Guardar los cambios en el archivo después de modificar el carrito
            this.saveCartsToFile(carts);

            logger.info("Producto agregado al carrito correctamente - Log de /src/daos/MONGO/MONGODBLOCAL/cartsDaoFS.js.", { cart: carts[cartIndex] });
            return { message: 'Producto agregado al carrito correctamente', cart: carts[cartIndex] };
        } catch (error) {
            logger.error("Error al agregar el producto al carrito - Log de /src/daos/MONGO/MONGODBLOCAL/cartsDaoFS.js:", error);
            throw error;
        }
    }
}

export default CartDaoFS;