import CartDto from "../dtos/carts.dto.js";
import { logger } from "../utils/logger.js";

export default class CartRepository {
    constructor(cartDao) {
        this.cartDao = cartDao;
    }

    // Obtener todos los carritos
    getAll = async () => {
        const carts = await this.cartDao.getAll();
        logger.info('Carritos obtenidos en getAll - src/repositories/cart.repository.js', carts); // Log info
        return carts.map(cart => new CartDto(cart)); // Transforma los datos en DTOs
    };

    // Obtener un carrito por ID
    getById = async (id) => {
        const cart = await this.cartDao.getBy({ _id: id });
        logger.info('Carrito obtenido en getById - src/repositories/cart.repository.js', cart); // Log info
        return cart ? new CartDto(cart) : null; // Transforma el carrito en DTO
    };

    // Crear un nuevo carrito
    createCart = async (cart) => {
        const newCart = await this.cartDao.create(cart);
        logger.info('Carrito creado en createCart - src/repositories/cart.repository.js', newCart); // Log info
        return new CartDto(newCart); // Transforma el carrito creado en un DTO y devolverlo
    };

    // Agregar producto al carrito
    addProductToCart = async (cartId, productId, quantity) => {
        const updatedCart = await this.cartDao.addProductToCart(cartId, productId, quantity);
        logger.info('Producto agregado al carrito en addProductToCart - src/repositories/cart.repository.js', updatedCart); // Log info
        return new CartDto(updatedCart); // Devuelve el carrito actualizado como DTO
    };

    // Actualizar la cantidad del producto en el carrito
    updateProductQuantity = async (cartId, productId, quantity) => {
        const updatedCart = await this.cartDao.updateProductQuantity(cartId, productId, quantity);
        logger.info('Cantidad del producto actualizada en updateProductQuantity - src/repositories/cart.repository.js', updatedCart); // Log info
        return new CartDto(updatedCart); // Devuelve el carrito actualizado como DTO
    };

    // Eliminar producto del carrito
    removeProductFromCart = async (cartId, productId) => {
        const updatedCart = await this.cartDao.removeProduct(cartId, productId);
        logger.info('Producto eliminado del carrito en removeProductFromCart - src/repositories/cart.repository.js', updatedCart); // Log info
        return new CartDto(updatedCart); // Devuelve el carrito actualizado como DTO
    };

    // Vaciar el carrito
    emptyCart = async (cartId) => {
        const updatedCart = await this.cartDao.emptyCart(cartId);
        logger.info('Carrito vaciado en emptyCart - src/repositories/cart.repository.js', updatedCart); // Log info
        return new CartDto(updatedCart); // Devuelve el carrito vacío como DTO
    };
}