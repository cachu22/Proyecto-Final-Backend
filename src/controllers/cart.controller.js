import mongoose from "mongoose";
import { cartService } from "../service/index.js";
import { adminOrUserAuth } from "../middlewares/Auth.middleware.js";
import { CustomError, CART_ERROR_CODE } from "../service/errors/CustomError.js";
import { addProductToCartError } from "../service/errors/info.js";
import { logger } from "../utils/logger.js";

class CartController {
    constructor() {
        this.cartService = cartService;
    }

    // Método para obtener todos los carritos
    getAll = async (req, res) => {
        try {
            const carts = await this.cartService.getAll();
            logger.info('Carritos obtenidos - Log de /src/controllers/cart.controller.js:', carts);
            res.send({ status: 'success', payload: carts });
        } catch (error) {
            logger.error('Error al obtener todos los carritos - Log de /src/controllers/cart.controller.js:', error);
            res.status(500).send({ status: 'error', message: 'Error al obtener todos los carritos' });
        }
    };

    // Método para obtener un carrito por ID
    getById = async (req, res) => {
        const { cid } = req.params;
        try {
            const result = await this.cartService.getById(cid);
            if (!result) {
                logger.warn(`No se encontró el carrito con el ID ${cid} - Log de /src/controllers/cart.controller.js`);
                res.status(404).send({ status: 'error', message: 'No se encontró el carrito con el ID especificado' });
            } else {
                logger.info(`Carrito con ID ${cid} encontrado - Log de /src/controllers/cart.controller.js:`, result);
                res.send({ status: 'success', payload: result });
            }
        } catch (error) {
            logger.error('Error al buscar el carrito por ID - Log de /src/controllers/cart.controller.js:', error);
            res.status(500).send({ status: 'error', message: 'Error al buscar el carrito por ID' });
        }
    };

    // Método para crear un carrito
    createCart = async (req, res) => {
        try {
            const newCart = await this.cartService.createCart();
            logger.info('Nuevo carrito creado - Log de /src/controllers/cart.controller.js:', newCart);
            res.status(201).json({ status: 'success', payload: newCart });
        } catch (error) {
            logger.error('Error al crear el carrito - Log de /src/controllers/cart.controller.js:', error);
            res.status(500).json({ status: 'error', message: 'Error al crear el carrito' });
        }
    };

    // Método para agregar un producto al carrito
    addProductToCart = async (req, res) => {
        try {
            const { cid, pid } = req.params;
            const { quantity } = req.body;

            if (!mongoose.Types.ObjectId.isValid(cid)) {
                const errorMessage = `El ID del carrito no es válido: ${cid}`;
                logger.error('Log de /src/controllers/cart.controller.js', errorMessage);
                throw CustomError.createError({
                    name: 'InvalidCartIdError',
                    cause: new Error(errorMessage),
                    message: addProductToCartError(pid, cid, errorMessage),
                    code: CART_ERROR_CODE
                });
            }

            if (!mongoose.Types.ObjectId.isValid(pid)) {
                const errorMessage = `El ID del producto no es válido: ${pid}`;
                logger.error('Log de /src/controllers/cart.controller.js', errorMessage);
                throw CustomError.createError({
                    name: 'InvalidProductIdError',
                    cause: new Error(errorMessage),
                    message: addProductToCartError(pid, cid, errorMessage),
                    code: CART_ERROR_CODE
                });
            }

            if (!quantity || isNaN(quantity) || quantity <= 0) {
                const errorMessage = `La cantidad del producto no es válida: ${quantity}`;
                logger.error('Log de /src/controllers/cart.controller.js', errorMessage);
                throw CustomError.createError({
                    name: 'InvalidQuantityError',
                    cause: new Error(errorMessage),
                    message: addProductToCartError(pid, cid, errorMessage),
                    code: CART_ERROR_CODE
                });
            }

            const result = await this.cartService.addProductToCart(cid, pid, quantity);
            logger.info('Producto agregado al carrito - Log de /src/controllers/cart.controller.js:', { cid, pid, quantity, result });
            res.send({ status: 'success', payload: result });
        } catch (error) {
            logger.error('Error al agregar el producto al carrito - Log de /src/controllers/cart.controller.js:', error);
            res.status(500).json({ status: 'error', message: error.message, code: error.code });
        }
    };

    // Método para actualizar la cantidad de un producto en el carrito
    updateProductQuantity = async (req, res) => {
        try {
            const { cid, pid } = req.params;
            const { quantity } = req.body;

            if (!quantity || isNaN(quantity) || quantity <= 0) {
                logger.warn(`Cantidad no válida para actualizar - Log de /src/controllers/cart.controller.js: ${quantity}`);
                return res.status(400).json({ status: 'error', message: 'Se requiere una cantidad válida' });
            }

            const updatedCart = await this.cartService.updateProductQuantity(cid, pid, quantity);
            logger.info('Cantidad de producto actualizada en el carrito - Log de /src/controllers/cart.controller.js:', { cid, pid, quantity, updatedCart });
            res.send({ status: 'success', payload: updatedCart });
        } catch (error) {
            logger.error('Error al actualizar la cantidad del producto en el carrito - Log de /src/controllers/cart.controller.js:', error);
            res.status(500).json({ status: 'error', message: 'Error al actualizar la cantidad del producto en el carrito' });
        }
    };

    // Método para eliminar un producto del carrito
    removeProductFromCart = async (req, res) => {
        try {
            const { cid, pid } = req.params;

            const result = await this.cartService.removeProductFromCart(cid, pid);
            logger.info('Producto eliminado del carrito - Log de /src/controllers/cart.controller.js:', { cid, pid, result });
            res.send({ status: 'success', message: 'Producto eliminado del carrito' });
        } catch (error) {
            logger.error('Error al eliminar el producto del carrito - Log de /src/controllers/cart.controller.js:', error);
            res.status(500).json({ status: 'error', message: 'Error al eliminar el producto del carrito' });
        }
    };

    // Método para vaciar el carrito
    deleteDate = async (req, res) => {
        try {
            const { cid } = req.params;

            const updatedCart = await this.cartService.emptyCart(cid);
            logger.info('Carrito vaciado - Log de /src/controllers/cart.controller.js:', { cid, updatedCart });
            res.send({ status: 'success', payload: updatedCart });
        } catch (error) {
            logger.error('Error al vaciar el carrito - Log de /src/controllers/cart.controller.js:', error);
            res.status(500).json({ status: 'error', message: 'Error al vaciar el carrito' });
        }
    };
}

export default CartController;