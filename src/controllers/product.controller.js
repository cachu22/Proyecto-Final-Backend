import { CustomError } from "../service/errors/CustomError.js";
import { EError } from "../service/errors/enums.js";
import { addProductError } from "../service/errors/info.js";
import { ProductService } from "../service/index.js";
import { generateProducts } from "../utils/generateProductsMock.js";
import { logger } from "../utils/logger.js";
import { userModel } from "../daos/MONGO/models/users.models.js";

class ProductController {
    constructor() {
        this.productService = ProductService;

        // Bind methods to ensure `this` refers to the instance of ProductController
        this.getAll = this.getAll.bind(this);
        this.getAllPaginated = this.getAllPaginated.bind(this);
        this.getProductsByCategory = this.getProductsByCategory.bind(this);
        this.getProductsAvailability = this.getProductsAvailability.bind(this);
        this.getProductsByPrice = this.getProductsByPrice.bind(this);
        this.getOne = this.getOne.bind(this);
        this.create = this.create.bind(this);
        this.put = this.put.bind(this);
        this.deleteDate = this.deleteDate.bind(this);
    }

    // Obtener todos los productos
    getAll = async (req, res) => {
        try {
            const products = await this.productService.getAll();
            res.send({ status: 'success', payload: products });
        } catch (error) {
            logger.error('Error al obtener todos los productos - Log de /src/controllers/product.controller.js:', error);
            res.status(500).send({ status: 'error', message: 'Error al obtener todos los productos' });
        }
    }

    // Traer productos paginados para el front
    getAllPaginated = async (req, res) => {
        try {
            const {
                limit,
                numPage,
                category,
                status,
                sortByPrice,
                order,
                explain,
                availability
            } = req.query;

            const parsedLimit = parseInt(limit, 10);
            const parsedNumPage = parseInt(numPage, 10);
            const parsedExplain = explain === 'true';
            // const parsedAvailability = availability === 'true';

            const products = await this.productService.getAllPaginated({
                limit: parsedLimit,
                numPage: parsedNumPage,
                category,
                status,
                sortByPrice,
                order,
                explain: parsedExplain,
                availability //parsedAvailability
            });

            res.send({ status: 'success', payload: products });
        } catch (error) {
            logger.error('Error al obtener productos paginados - Log de /src/controllers/product.controller.js:', error);
            res.status(500).send({ status: 'error', message: 'Error al obtener todos los productos' });
        }
    };

    // Obtener producto por ID
    getOne = async (req, res) => {
        try {
            const productId = req.params.pid;
            if (!productId) {
                return res.status(400).json({ status: 'error', message: 'ID Erroneo' });
            }
            const product = await this.productService.getOne(productId);
            if (!product) {
                return res.status(404).json({ status: 'error', message: 'Product not found' });
            }
            logger.info('Datos del producto - Log de /src/controllers/product.controller.js:', product);
            res.json({ status: 'success', payload: product });
        } catch (error) {
            logger.error('Error al obtener el producto - Log de /src/controllers/product.controller.js:', error);
            res.status(500).json({ status: 'error', message: 'Server error' });
        }
    }

    // Obtener productos por categoría
    getProductsByCategory = async (req, res) => {
        const category = req.params.category;
        try {
            const result = await this.productService.getAll({ category });
            res.send({ status: 'success', payload: result });
        } catch (error) {
            logger.error('Error al obtener productos por categoría - Log de /src/controllers/product.controller.js:', error);
            res.status(500).send({ status: 'error', message: 'Error al obtener productos por categoría' });
        }
    };

    // Obtener productos por disponibilidad
    getProductsAvailability = async (req, res) => {
        const availability = req.params.availability === 'true';
        try {
            const result = await this.productService.getAll({ availability });
            res.send({ status: 'success', payload: result });
        } catch (error) {
            logger.error('Error al obtener productos por disponibilidad - Log de /src/controllers/product.controller.js:', error);
            res.status(500).send({ status: 'error', message: 'Error al obtener productos por disponibilidad' });
        }
    };

    // Obtener productos ordenados por precio
    getProductsByPrice = async (req, res) => {
        const sortByPrice = req.params.sortByPrice === 'price' ? 'price' : null;
        const order = req.params.order === 'asc' ? 1 : req.params.order === 'desc' ? -1 : null;
    
        if (!sortByPrice || order === null) {
            return res.status(400).send({ status: 'error', message: 'Parámetros de ordenamiento no válidos' });
        }
    
        try {
            const result = await this.productService.getAll({ sortByPrice, order });
            res.send({ status: 'success', payload: result });
        } catch (error) {
            logger.error('Error al obtener productos ordenados por precio - Log de /src/controllers/product.controller.js:', error);
            res.status(500).send({ status: 'error', message: 'Error al obtener productos ordenados por precio' });
        }
    };

    create = async (req, res) => {
        try {
            const { title, model, description, price, code, thumbnails, stock, category } = req.body;
    
            if (!title || !model || !description || !price || !thumbnails || !code || !stock || !category) {
                console.error('Error al crear el producto - Faltan datos para crear el producto - Log de /src/controllers/product.controller.js');
                return res.status(400).json({
                    status: 'error',
                    message: 'Faltan datos para crear el producto'
                });
            }
    
            let owner = 'admin';
            if (req.user && req.user.role === 'premium') {
                owner = req.user.email; // o req.user._id si prefieres almacenar el _id
            }
    
            const newProduct = {
                title,
                model,
                description,
                price,
                thumbnails,
                code,
                stock,
                category,
                owner
            };
    
            const result = await this.productService.create(newProduct);
            res.status(201).json({ status: 'success', payload: result });
        } catch (error) {
            console.error('Error al crear el producto - Log de /src/controllers/product.controller.js:', error);
            res.status(500).json({ status: 'error', message: 'Error al agregar el producto', error: error.message });
        }
    };

    // Actualizar un producto
    put = async (req, res) => {
        const { pid } = req.params;
        const updatedProductData = req.body;
        try {
            const result = await this.productService.updateProduct(pid, updatedProductData);
            res.send({ status: 'success', payload: result });
        } catch (error) {
            console.error('Error al actualizar el producto - Log de /src/controllers/product.controller.js:', error);
            res.status(500).send({ status: 'error', message: 'Error al actualizar el producto', error: error.message });
        }
    };

    // Eliminar un producto
    deleteDate = async (req, res) => {
        try {
            const productId = req.params.id;
            const product = await this.productService.delete(productId);
    
            if (!product) {
                return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
            }
    
            if (req.user.role !== 'admin' && product.owner !== req.user.email) {
                return res.status(403).json({ status: 'error', message: 'No tiene permisos para eliminar este producto' });
            }
    
            await this.productService.delete(productId);
            res.status(200).json({ status: 'success', message: 'Producto eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar el producto - Log de /src/controllers/product.controller.js:', error);
            res.status(500).json({ status: 'error', message: 'Error al eliminar el producto', error: error.message });
        }
    }
}

export default ProductController;