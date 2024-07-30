import express from 'express';
import productController from '../../controllers/product.controller.js';

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
}= new productController()

// Rutas para productos de MongoDB
mgProducts.get('/', getAll);

// Consulta para traer los productos con paginación
mgProducts.get('/products', getAllPaginated);

// Consulta para traer productos filtrados por categoría:
mgProducts.get('/products/category/:category', getProductsByCategory);

// Consulta para traer productos filtrados por disponibilidad
mgProducts.get('/products/status/:availability', getProductsAvailability);

//Consulta para traer productos ordenados por precio
mgProducts.get('/products/sort/:sortByPrice/:order', getProductsByPrice);

// Ruta para traer un producto por su id
mgProducts.get('/:pid', getOne);

// Ruta para agregar un nuevo producto
mgProducts.post('/', create);

// Ruta para actualizar un producto por su ID
mgProducts.put('/:pid', put);

// Ruta para eliminar un producto por su ID
mgProducts.delete('/:pid', deleteDate);

export default mgProducts;