import express from 'express';
import ProductDaoFS from '../../daos/MONGO/MONGODBLOCAL/productDao.FS.js';
import { logger } from '../../utils/logger.js';

const router = express.Router();
const manager = new ProductDaoFS('./src/file/products.json');

// Ruta para listar todos los productos (GET /)
router.get('/', (req, res) => {
    const { limit } = req.query; // Obtiene el parámetro 'limit' de la consulta
    let products = manager.getProducts("test"); // Obtiene todos los productos del gestor de productos
    
    // Aplica un límite a la lista de productos si se proporciona el parámetro 'limit' en la consulta
    if (limit) {
        products = products.slice(0, parseInt(limit)); // Limita la lista de productos
    }
    
    logger.info('Lista de productos obtenida - src/Routes/api/productsRouterFS.js', products); // Registro de los productos obtenidos
    res.json(products); // Envía la lista de productos como respuesta en formato JSON
});

// Ruta para obtener un producto por su ID (GET /:pid)
router.get('/:pid', (req, res) => {
    const { pid } = req.params; // Obtiene el parámetro de ruta 'pid' que representa el ID del producto
    const product = manager.getProductById(parseInt(pid)); // Obtiene el producto por su ID
    
    // Verifica si se encontró el producto y envía una respuesta adecuada
    if (product) {
        logger.info('Producto encontrado - src/Routes/api/productsRouterFS.js', product); // Registro del producto encontrado
        res.json(product); // Envía el producto encontrado como respuesta en formato JSON
    } else {
        logger.info('Producto no encontrado - src/Routes/api/productsRouterFS.js', { pid }); // Registro del error
        res.status(404).json({ error: 'Producto no encontrado' }); // Envía un mensaje de error si el producto no se encuentra
    }
});

// Ruta para agregar un nuevo producto con campos (POST /)
router.post('/', (req, res) => {
    const productData = req.body;
    try {
        const newProduct = manager.addProduct(productData);
        logger.info('Nuevo producto agregado - src/Routes/api/productsRouterFS.js', newProduct); // Registro del nuevo producto creado
        res.status(201).json(newProduct);
    } catch (error) {
        logger.error('Error al agregar producto - src/Routes/api/productsRouterFS.js', error); // Registro del error
        res.status(400).json({ error: error.message });
    }
});

// Ruta para actualizar un producto por su ID (PUT /:pid)
router.put('/:pid', (req, res) => {
    const { pid } = req.params; // Obtiene el parámetro de ruta 'pid' que representa el ID del producto
    const productData = req.body; // Obtiene los datos del cuerpo de la solicitud

    try {
        const updatedProduct = manager.updateProduct(parseInt(pid), productData); // Actualiza el producto por su ID
        logger.info('Producto actualizado - src/Routes/api/productsRouterFS.js', updatedProduct); // Registro del producto actualizado
        res.json(updatedProduct); // Envía el producto actualizado como respuesta en formato JSON
    } catch (error) {
        logger.error('Error al actualizar producto - src/Routes/api/productsRouterFS.js', error); // Registro del error
        res.status(404).json({ error: error.message }); // Envía un mensaje de error si el producto no se puede actualizar
    }
});

// Ruta para eliminar un producto por su ID LF
router.delete('/:pid', (req, res) => {
    const { pid } = req.params; // Obtiene el parámetro de ruta 'pid' que representa el ID del producto
    try {
        manager.deleteProduct(parseInt(pid)); // Elimina el producto por su ID
        logger.info('Producto eliminado - src/Routes/api/productsRouterFS.js', { pid }); // Registro del producto eliminado
        res.status(200).json({ message: 'Producto eliminado correctamente' }); // Envía un mensaje de éxito
    } catch (error) {
        logger.error('Error al eliminar producto - src/Routes/api/productsRouterFS.js', error); // Registro del error
        res.status(404).json({ error: 'Producto no encontrado' }); // Envía un mensaje de error si el producto no se puede eliminar
    }
});

export default router;