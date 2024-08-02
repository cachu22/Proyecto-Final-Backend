import { CustomError } from "../service/errors/CustomError.js";
import { EError } from "../service/errors/enums.js";
import { addProductError } from "../service/errors/info.js";
import { ProductService } from "../service/index.js";
import { generateProducts } from "../utils/generateProductsMock.js";
import { logger } from "../utils/logger.js";
import { userModel } from "../daos/MONGO/models/users.models.js";
import mongoose from "mongoose";

class ProductController {
    constructor() {
        this.productService = ProductService;

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
            if (!mongoose.Types.ObjectId.isValid(productId)) {
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

    // Método asíncrono para manejar la creación de un nuevo producto
    create = async (req, res) => {
        try {
            // Extrae los datos del producto del cuerpo de la solicitud
            const { title, model, description, price, code, thumbnails, stock, category } = req.body;
    
            // Verifica si todos los campos necesarios están presentes
            if (!title || !model || !description || !price || !thumbnails || !code || !stock || !category) {
                // Registra un error en la consola si faltan datos
                console.error('Error al crear el producto - Faltan datos para crear el producto');
                // Responde con un error 400 (Bad Request) y un mensaje de error
                return res.status(400).json({ status: 'error', message: 'Faltan datos para crear el producto' });
            }
    
            // Obtiene el ID y el rol del usuario desde la solicitud autenticada
            const userId = req.user?._id;
            const userRole = req.user?.role;

            console.log('ID del usuario:', userId);
            console.log('Rol del usuario:', userRole);
    
            // Verifica si el ID del usuario está presente (es decir, si el usuario está autenticado)
            if (!userId) {
                // Responde con un error 401 (Unauthorized) y un mensaje de error si el usuario no está autenticado
                return res.status(401).json({ status: 'error', message: 'Usuario no autenticado' });
            }
    
            // Inicializa el campo 'owner' según el rol del usuario
            let owner;
            if (userRole === 'premium' || userRole === 'admin') {
                owner = userId; // Usa el ID del usuario tanto para 'premium' como para 'admin'
            } else {
                return res.status(403).json({ status: 'error', message: 'Rol de usuario no autorizado para crear productos' });
            }
    
            // Crea un objeto de nuevo producto con los datos proporcionados y el campo 'owner' determinado
            const newProduct = {
                title,
                model,
                description,
                price,
                code,
                thumbnails,
                stock,
                category,
                owner
            };
    
            // Llama al servicio de productos para crear el nuevo producto en la base de datos
            const result = await this.productService.create(newProduct);
    
            // Responde con un estado 201 (Created) y el producto creado en el payload
            res.status(201).json({ status: 'success', payload: result });
        } catch (error) {
            // Registra un mensaje de error en la consola si ocurre una excepción
            console.error('Error al crear el producto:', error);
            // Responde con un estado 500 (Internal Server Error) y un mensaje de error
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
            const userId = req.user?._id;
            const userRole = req.user?.role;

            console.log('ID del producto recibido:', productId);
            console.log('ID del usuario:', userId);
            console.log('Rol del usuario:', userRole);

            // Verifica si el ID del usuario está presente (es decir, si el usuario está autenticado)
            if (!userId) {
                // Responde con un error 401 (Unauthorized) y un mensaje de error si el usuario no está autenticado
                return res.status(401).json({ status: 'error', message: 'Usuario no autenticado' });
            }
            
            const product = await this.productService.getOne(productId);

            if (!product) {
                return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
            }

            if (!product.owner) {
                return res.status(500).json({ status: 'error', message: 'Error interno del servidor: Owner del producto no encontrado' });
            }

            if (userRole === 'admin') {
                await this.productService.delete(productId);
                return res.status(200).json({ status: 'success', message: 'Producto eliminado correctamente' });
            }

            if (userRole === 'premium' && product.owner.toString() === userId.toString()) {
                await this.productService.delete(productId);
                return res.status(200).json({ status: 'success', message: 'Producto eliminado correctamente' });
            }

            return res.status(403).json({ status: 'error', message: 'No tiene permisos para eliminar este producto' });
        } catch (error) {
            console.error('Error al eliminar el producto - Log de /src/controllers/product.controller.js:', error);
            res.status(500).json({ status: 'error', message: 'Error al eliminar el producto', error: error.message });
    }
};
}

export default ProductController;