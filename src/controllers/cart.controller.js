import mongoose from "mongoose";
import { CartService } from "../service/index.js";
import { adminOrUserAuth } from "../middlewares/Auth.middleware.js";
import { CustomError, CART_ERROR_CODE } from "../service/errors/CustomError.js";
import { addProductToCartError } from "../service/errors/info.js";
import { logger } from "../utils/logger.js";
import { ProductService } from "../service/index.js";
import { ticketModel } from "../daos/MONGO/models/ticket.model.js";
import { v4 as uuidv4 } from "uuid";
import CartRepository from "../repositories/cart.repository.js"; //Se importa aqui porque desde el service no funciona
import { CartsDao } from "../daos/factory.js"; //Se importa aqui porque desde el service no funciona
import ProductRepository from "../repositories/product.repository.js";
import { ProductsDao } from "../daos/factory.js";

class CartController {
    constructor() {
        this.cartService = CartService;
        this.productService = ProductService;
    }


   // Método para obtener todos los carritos
    getAll = async (req, res) => {
        try {
            const carts = await this.cartService.getAll();
            logger.info('Carritos obtenidos:', carts);
            res.send({ status: 'success', payload: carts });
        } catch (error) {
            logger.error('Error al obtener todos los carritos:', error);
            res.status(500).send({ status: 'error', message: 'Error al obtener todos los carritos' });
        }}

    // Método para obtener un carrito por ID
    getById = async (req, res) => {
        const { cid } = req.params;
        try {
            logger.info(`Recibiendo solicitud para obtener carrito con ID ${cid}`);
            const result = await this.cartService.getById(cid);
            if (!result) {
                logger.warning(`No se encontró el carrito con el ID ${cid} - Log de /src/controllers/cart.controller.js3`);
                return res.status(404).send({ status: 'error', message: 'No se encontró el carrito con el ID especificado' });
            }
            logger.info(`Carrito con ID ${cid} encontrado - Log de /src/controllers/cart.controller.js4:`, result);
            return res.send({ status: 'success', payload: result });
        } catch (error) {
            logger.error('Error al buscar el carrito por ID - Log de /src/controllers/cart.controller.js5:', error);
            return res.status(500).send({ status: 'error', message: 'Error al buscar el carrito por ID' });
        }
    };

    // Método para crear un carrito
    create = async (req, res) => {
        try {
            const newCart = await this.cartService.create();
            logger.info('Nuevo carrito creado - Log de /src/controllers/cart.controller.js6:', newCart);
            res.status(201).json({ status: 'success', payload: newCart });
        } catch (error) {
            logger.error('Error al crear el carrito - Log de /src/controllers/cart.controller.js7:', error);
            res.status(500).json({ status: 'error', message: 'Error al crear el carrito' });
        }
    };

    // Método para agregar un producto al carrito
    add = async (req, res) => {
        try {
            const { cid, pid } = req.params;
            const { quantity } = req.body;
            const userId = req.user?.id; // Asegúrate de usar req.user?.id
            const userRole = req.user?.role;
    
            logger.info('Información del usuario-CartController', {
                userId,
                userRole,
                user: req.user
            });
    
            if (!mongoose.Types.ObjectId.isValid(cid)) {
                const errorMessage = `El ID del carrito no es válido: ${cid}`;
                logger.error('Log de /src/controllers/cart.controller.js8', errorMessage);
                throw CustomError.createError({
                    name: 'InvalidCartIdError',
                    cause: new Error(errorMessage),
                    message: addProductToCartError(pid, cid, errorMessage),
                    code: CART_ERROR_CODE
                });
            }
    
            if (!mongoose.Types.ObjectId.isValid(pid)) {
                const errorMessage = `El ID del producto no es válido: ${pid}`;
                logger.error('Log de /src/controllers/cart.controller.js9', errorMessage);
                throw CustomError.createError({
                    name: 'InvalidpidError',
                    cause: new Error(errorMessage),
                    message: addProductToCartError(pid, cid, errorMessage),
                    code: CART_ERROR_CODE
                });
            }
    
            if (!quantity || isNaN(quantity) || quantity <= 0) {
                const errorMessage = `La cantidad del producto no es válida: ${quantity}`;
                logger.error('Log de /src/controllers/cart.controller.js10', errorMessage);
                throw CustomError.createError({
                    name: 'InvalidQuantityError',
                    cause: new Error(errorMessage),
                    message: addProductToCartError(pid, cid, errorMessage),
                    code: CART_ERROR_CODE
                });
            }
    
            // Obtener el producto
            const product = await this.productService.getOne(pid);
    
            if (!product) {
                const errorMessage = `Producto no encontrado: ${pid}`;
                logger.error('Log de /src/controllers/cart.controller.js11', errorMessage);
                return res.status(404).json({ status: 'error', message: errorMessage });
            }
    
            // Asegúrate de que product.owner es una cadena
            const productOwnerId = typeof product.owner === 'string' ? product.owner : product.owner.toString();
    
            logger.info('Información del producto', {
                product,
                productOwnerId
            });
    
            // Verificar si el usuario es admin
            if (userRole === 'admin') {
                const errorMessage = 'Los usuarios admin no pueden agregar productos al carrito.';
                logger.error('Log de /src/controllers/cart.controller.js13', errorMessage);
                return res.status(403).json({ status: 'error', message: errorMessage });
            }
    
            // Verificar si el usuario es premium
            if (userRole === 'premium') {
                // No permitir que un usuario premium agregue su propio producto a su carrito
                if (productOwnerId === userId) {
                    const errorMessage = 'No puedes agregar tu propio producto a tu carrito.';
                    logger.error('Log de /src/controllers/cart.controller.js14', errorMessage);
                    return res.status(403).json({ status: 'error', message: errorMessage });
                }
            }
    
            // Agregar el producto al carrito
            const result = await this.cartService.add(cid, pid, quantity);
            logger.info('Producto agregado al carrito - Log de /src/controllers/cart.controller.js15:', { cid, pid, quantity, result });
            res.send({ status: 'success', payload: result });
        } catch (error) {
            logger.error('Error al agregar el producto al carrito - Log de /src/controllers/cart.controller.js16:', error);
            res.status(500).json({ status: 'error', message: error.message, code: error.code });
        }
    };

    // Método para actualizar la cantidad de un producto en el carrito
    update = async (req, res) => {
        try {
            const { cid, pid } = req.params;
            const { quantity } = req.body;

            if (!quantity || isNaN(quantity) || quantity <= 0) {
                logger.warning(`Cantidad no válida para actualizar - Log de /src/controllers/cart.controller.js15: ${quantity}`);
                return res.status(400).json({ status: 'error', message: 'Se requiere una cantidad válida' });
            }

            const updatedCart = await this.cartService.update(cid, pid, quantity);
            logger.info('Cantidad de producto actualizada en el carrito - Log de /src/controllers/cart.controller.js16:', { cid, pid, quantity, updatedCart });
            res.send({ status: 'success', payload: updatedCart });
        } catch (error) {
            logger.error('Error al actualizar la cantidad del producto en el carrito - Log de /src/controllers/cart.controller.js17:', error);
            res.status(500).json({ status: 'error', message: 'Error al actualizar la cantidad del producto en el carrito' });
        }
    };

    // Método para eliminar un producto del carrito
    remove = async (req, res) => {
        try {
            const { cid, pid } = req.params;

            const result = await this.cartService.remove(cid, pid);
            logger.info('Producto eliminado del carrito - Log de /src/controllers/cart.controller.js18:', { cid, pid, result });
            res.send({ status: 'success', message: 'Producto eliminado del carrito' });
        } catch (error) {
            logger.error('Error al eliminar el producto del carrito - Log de /src/controllers/cart.controller.js19:', error);
            res.status(500).json({ status: 'error', message: 'Error al eliminar el producto del carrito' });
        }
    };

    // Método para vaciar el carrito
    deleteDate = async (req, res) => {
        try {
            const { cid } = req.params;

            const updatedCart = await this.cartService.deleteDate(cid);
            logger.info('Carrito vaciado - Log de /src/controllers/cart.controller.js20:', { cid, updatedCart });
            res.send({ status: 'success', payload: updatedCart });
        } catch (error) {
            logger.error('Error al vaciar el carrito - Log de /src/controllers/cart.controller.js21:', error);
            res.status(500).json({ status: 'error', message: 'Error al vaciar el carrito' });
        }
    };

    //Metodo de compras
    async purchase(req, res) {
        const { cid } = req.params;
    
        try {
            // Instanciar el servicio de carrito y producto dentro del método
            const cartService = new CartRepository(new CartsDao());
    
            // Obtener el carrito por ID
            const cart = await cartService.getById(cid); // Usa cartService
            if (!cart) {
                return res.status(404).json({ message: 'Carrito no encontrado' });
            }
    
            // Instanciar el servicio de productos dentro del método
            const productService = new ProductRepository(new ProductsDao());
    
            // Verificar el stock de los productos en el carrito
            const outOfStockProducts = [];
            const productsToUpdate = [];
    
            for (const item of cart.products) {
                const product = await productService.getOne(item.product._id);
                if (!product || product.stock < item.quantity) {
                    outOfStockProducts.push({
                        pid: item.product._id,
                        required: item.quantity,
                        available: product ? product.stock : 0
                    });
                } else {
                    productsToUpdate.push({
                        pid: item.product._id,
                        quantity: item.quantity
                    });
                }
            }
    
            if (outOfStockProducts.length > 0) {
                return res.status(400).json({
                    message: 'No se pudo procesar la compra debido a falta de stock',
                    outOfStockProducts
                });
            }
    
            // Calcular el total del carrito
            let totalAmount = 0;
            for (const item of cart.products) {
                const product = await productService.getOne(item.product._id);
                totalAmount += product.price * item.quantity;
            }
    
            // Generar un código único para el ticket
            const ticketCode = uuidv4();
    
            // Crear un ticket con los detalles de la compra
            const ticket = await ticketModel.create({
                code: ticketCode,
                purchase_datetime: new Date(),
                amount: totalAmount,
                purchaser: req.user.email
            });
    
            // Actualizar el stock de los productos
            for (const { pid, quantity } of productsToUpdate) {
                await productService.updateStock(pid, -quantity);
            }
    
            // Vaciar el carrito después de la compra
            await cartService.deleteDate(cid);
    
            res.status(200).json({ message: 'Compra realizada con éxito', ticket });
        } catch (error) {
            console.error('Error en purchase:', error);
            res.status(500).json({ message: 'Error al realizar la compra', error: error.message });
        }
    }
}

export default CartController;