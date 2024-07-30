import mongoose from "mongoose";
import { cartsModel } from "../models/carts.models.js";
import { logger } from "../../../utils/logger.js";

class CartDaoMongo {
    constructor(){
        this.model = cartsModel;
    }

    async getAll(explain = false) {
        try {
            const query = this.model.find();
            if (explain) {
                const explanation = await query.explain('executionStats');
                logger.info('Explicación de la consulta - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', explanation);
                return explanation;
            }
            const carts = await query;
            logger.info('Todos los carritos obtenidos - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', carts);
            return carts;
        } catch (error) {
            logger.error('Error al obtener todos los carritos - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', error.message);
            throw new Error('Error al obtener todos los carritos: ' + error.message);
        }
    }

    async getCartById(_id) { 
        try {
            const cart = await this.model.findById(_id).populate('products.product');
            if (!cart) {
                logger.error('El carrito no se encontró con ID - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', _id);
                throw new Error('El carrito no se encontró');
            }
            logger.info('Carrito obtenido con éxito - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', cart);
            return cart;
        } catch (error) {
            logger.error('Error al obtener el carrito por ID - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', error.message);
            throw new Error('Error al obtener el carrito por ID: ' + error.message);
        }
    }

    async create(cartData) {
        try {
            const newCart = new this.model(cartData);
            const savedCart = await newCart.save();
            logger.info('Nuevo carrito creado - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', savedCart);
            return savedCart;
        } catch (error) {
            logger.error('Error al crear el carrito - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', error.message);
            throw new Error('Error al crear el carrito: ' + error.message);
        }
    }

    async addProductToCart(cartId, productId, quantity) {
        try {
            // Verificar si el carrito existe
            const cart = await this.model.findById(cartId);
            if (!cart) {
                logger.error('El carrito no existe con ID - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', cartId);
                throw new Error('El carrito no existe');
            }

            // Verificar si el producto ya está en el carrito
            const productIndex = cart.products.findIndex(
                (p) => p.product.toString() === productId.toString()
            );

            if (productIndex !== -1) {
                // Si el producto ya está en el carrito, actualizar la cantidad
                cart.products[productIndex].quantity += quantity;
            } else {
                // Si el producto no está en el carrito, agregarlo
                cart.products.push({ product: productId, quantity });
            }

            // Guardar los cambios en el carrito
            const updatedCart = await cart.save();
            logger.info('Producto agregado al carrito - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', updatedCart);
            return updatedCart;
        } catch (error) {
            logger.error('Error al agregar el producto al carrito - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', error.message);
            throw new Error('Error al agregar el producto al carrito: ' + error.message);
        }
    }

    async updateCartProducts(cartId, updatedProducts) {
        try {
            const cart = await this.model.findById(cartId);
            if (!cart) {
                logger.error('El carrito no existe con ID - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', cartId);
                throw new Error('El carrito no existe');
            }

            for (const updatedProduct of updatedProducts) {
                const { productId, quantity } = updatedProduct;
                const existingProductIndex = cart.products.findIndex(product => product.product.toString() === productId);

                if (existingProductIndex !== -1) {
                    cart.products[existingProductIndex].quantity += quantity;
                } else {
                    cart.products.push({ product: productId, quantity });
                }
            }

            await cart.save();
            logger.info('Productos del carrito actualizados con éxito - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', cart);
            return cart;
        } catch (error) {
            logger.error('Error al actualizar los productos del carrito - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', error.message);
            throw new Error('Error al actualizar los productos del carrito: ' + error.message);
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            logger.info(`Buscando el carrito con ID - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js: ${cartId}`);
            const cart = await this.model.findById(cartId);
            if (!cart) {
                logger.error('El carrito no existe con ID - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', cartId);
                throw new Error('El carrito no existe');
            }

            logger.info(`Buscando el producto con ID - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js: ${productId} en el carrito`);
            const product = cart.products.find(item => 
                new mongoose.Types.ObjectId(item.product).equals(new mongoose.Types.ObjectId(productId))
            );
            if (!product) {
                logger.error('El producto no está en el carrito con ID - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', productId);
                throw new Error('El producto no está en el carrito');
            }

            product.quantity = quantity;
            await cart.save();
            logger.info('Cantidad del producto actualizada exitosamente - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', cart);
            return cart;
        } catch (error) {
            logger.error('Error al actualizar la cantidad del producto en el carrito - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', error.message);
            throw new Error('Error al actualizar la cantidad del producto en el carrito: ' + error.message);
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await this.model.findById(cartId).populate('products.product');
            if (!cart) {
                logger.error('El carrito no existe con ID - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', cartId);
                throw new Error('El carrito no existe');
            }

            const productIndex = cart.products.findIndex(item => item.product._id.toString() === productId);
            if (productIndex === -1) {
                logger.error('El producto no está en el carrito con ID - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', productId);
                throw new Error('El producto no está en el carrito');
            }

            cart.products.splice(productIndex, 1);
            await cart.save();
            logger.info('Producto eliminado del carrito - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', cart);
            return cart;
        } catch (error) {
            logger.error('Error al eliminar el producto del carrito - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', error.message);
            throw new Error('Error al eliminar el producto del carrito: ' + error.message);
        }
    }

    async emptyCart(cartId) {
        try {
            const cart = await this.model.findById(cartId);
            if (!cart) {
                logger.error('El carrito no existe con ID - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', cartId);
                throw new Error('El carrito no existe');
            }

            cart.products = [];
            await cart.save();
            logger.info('Carrito vaciado con éxito - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', cart);
            return cart;
        } catch (error) {
            logger.error('Error al vaciar el carrito - Log de /src/daos/MONGO/MONGODBNUBE/cartsDao.mongo.js:', error.message);
            throw new Error('Error al vaciar el carrito: ' + error.message);
        }
    }
}

export default CartDaoMongo;