import { logger } from "../utils/logger.js";

export default class CartDto {
    constructor(cart) {
        if (!cart) {
            logger.error('Cart data is required - Log de /src/dtos/carts.dto.js');
            throw new Error('Cart data is required');
        }
        if (!cart._id) {
            logger.error('Cart must have an _id - Log de /src/dtos/carts.dto.js');
            throw new Error('Cart must have an _id');
        }
        
        this.id = cart._id;
        this.products = cart.products || [];
        this.createdAt = cart.createdAt;
        this.updatedAt = cart.updatedAt;
        
        // Log de la creacion de newDto
        logger.info('Created new CartDto - Log de /src/dtos/carts.dto.js:', {
            id: this.id,
            products: this.products,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        });
    }
}