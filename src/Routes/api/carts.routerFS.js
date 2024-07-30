import fs from 'fs';
import { Router } from 'express';
import CartDaoFS from '../../daos/MONGO/MONGODBLOCAL/cartsDaoFS.js';
import { adminAuth } from '../../middlewares/Auth.middleware.js';
import { logger } from '../../utils/logger.js';

const routerFSC = Router();
const manager = new CartDaoFS('./src/file/carts.json');

let carts = [];

// Leer los carritos del archivo carts.json al inicio del programa
fs.readFile('./src/file/carts.json', 'utf8', (err, data) => {
    if (!err) {
        carts = JSON.parse(data); // Asignar datos leídos a la variable carts
    } else {
        logger.error('Error al leer el archivo carts.json - src/Routes/api/carts.routerFS.js:', err); // Log error
    }
});

// Ruta para listar todos los carritos (GET /)
routerFSC.get('/', adminAuth, (req, res) => {
    const { limit } = req.query; // Obtiene el parámetro 'limit' de la consulta
    let carts = manager.getCartsFromFile(); // Obtiene todos los carritos del gestor de carritos

    // Aplica un límite a la lista de productos si se proporciona el parámetro 'limit' en la consulta
    if (limit) {
        carts = carts.slice(0, parseInt(limit)); // Limita la lista de carritos
    }

    res.json(carts); // Envía la lista de productos como respuesta en formato JSON
});

// Ruta POST para crear un nuevo carrito
routerFSC.post('/', (req, res) => {
    try {
        const newCart = manager.createCart(); // Llama al método createCart de manager
        res.json(newCart); // Enviar el nuevo carrito como respuesta
        logger.info('Carrito creado - src/Routes/api/carts.routerFS.js:', newCart); // Log info
    } catch (error) {
        logger.error('Error al crear el carrito - src/Routes/api/carts.routerFS.js:', error); // Log error
        res.status(500).json({ error: 'Error al crear el carrito' }); // Manejo de errores
    }
});

// Ruta para listar todos los productos de un carrito (GET /:cid)
routerFSC.get('/:cid', (req, res) => {
    const { cid } = req.params; // Obtener el ID del carrito desde los parámetros de la ruta

    // Obtener el carrito por su ID usando el método getCartById de manager
    const cart = manager.getCartById(parseInt(cid));

    // Verificar si se encontró el carrito
    if (!cart) {
        logger.warn('Carrito no encontrado - src/Routes/api/carts.routerFS.js, ID:', cid); // Log warning
        return res.status(404).json({ error: 'Carrito no encontrado' }); // Enviar un mensaje de error si el carrito no se encuentra
    }

    // Verificar si el carrito está vacío
    if (cart.products.length === 0) {
        logger.warn('El carrito está vacío - src/Routes/api/carts.routerFS.js, ID:', cid); // Log warning
        return res.status(404).json({ error: 'El carrito está vacío' });
    }

    // Crear una nueva estructura de respuesta para el array de carrito
    const response = {
        "id de carrito": cart["id de carrito"],
        "products": cart.products.map(product => ({
            "id de producto": product["id de producto"],
            "quantity": product.quantity
        }))
    };
    res.json(response); // Enviar los productos del carrito como respuesta
    logger.info('Productos del carrito - src/Routes/api/carts.routerFS.js, ID:', cid, 'Productos:', response.products); // Log info
});

// Agregar un producto al carrito
routerFSC.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        // Llamar al método addProductToCart del manager
        const result = await manager.addProductToCart(parseInt(cid), parseInt(pid));

        res.json(result);
        logger.info('Producto agregado al carrito - src/Routes/api/carts.routerFS.js, Carrito ID:', cid, 'Producto ID:', pid); // Log info
    } catch (error) {
        logger.error('Error al agregar el producto al carrito - src/Routes/api/carts.routerFS.js:', error); // Log error
        res.status(500).json({ error: 'Error al agregar el producto al carrito' });
    }
});

export { routerFSC as cartsRouterFS };