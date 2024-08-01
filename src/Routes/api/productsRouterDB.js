import express from 'express';
import productController from '../../controllers/product.controller.js';
import { authenticateToken, authenticateUser, authorizeRoles } from '../../middlewares/Auth.middleware.js';

const mgProducts = express.Router();
const {
    getAll,
    getAllPaginated,
    getProductsByCategory,
    getProductsAvailability,
    getProductsByPrice,
    getOne,
    create,
    put,
    deleteDate
} = new productController();

// Middleware para verificar los parámetros de la ruta
const validateProductParams = (req, res, next) => {
    if (!req.params.pid) {
        return res.status(400).json({ status: 'error', message: 'Falta el parámetro de id de producto' });
    }
    next();
};

// Rutas para productos de MongoDB
mgProducts.get('/', getAll);

// Consulta para traer los productos con paginación
mgProducts.get('/products', getAllPaginated);

// Consulta para traer productos filtrados por categoría
mgProducts.get('/products/category/:category', getProductsByCategory);

// Consulta para traer productos filtrados por disponibilidad
mgProducts.get('/products/status/:availability', getProductsAvailability);

// Consulta para traer productos ordenados por precio
mgProducts.get('/products/sort/:sortByPrice/:order', getProductsByPrice);

// Ruta para traer un producto por su id
mgProducts.get('/:pid', validateProductParams, getOne);

// Ruta para agregar un nuevo producto
mgProducts.post('/', authenticateToken, authenticateUser, authorizeRoles, create);

// Ruta para actualizar un producto por su ID
mgProducts.put('/:pid', validateProductParams, authenticateToken, authenticateUser, authorizeRoles, put);

// Ruta para eliminar un producto por su ID
mgProducts.delete('/:pid', validateProductParams, authenticateToken, authenticateUser, authorizeRoles, deleteDate);

export default mgProducts;