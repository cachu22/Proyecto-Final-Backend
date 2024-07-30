import express from 'express';
import cartController from "../../controllers/cart.controller.js";
import { adminAuth, adminOrUserAuth, userAuth, authenticateToken } from "../../middlewares/Auth.middleware.js"

const cartsRouterMSG = express.Router();
const {
    getAll,
    getById,
    createCart,
    addProductToCart,
    updateProductQuantity,
    removeProductFromCart,
    deleteDate
}= new cartController()

// Ruta para traer todos los carros
cartsRouterMSG.get('/', adminAuth, getAll);

// Ruta para traer un carro por su id
cartsRouterMSG.get('/:cid', adminOrUserAuth, getById);

// Ruta POST para crear un nuevo carrito
cartsRouterMSG.post('/', createCart);

// Ruta para agregar productos al carrito
cartsRouterMSG.post('/:cid/product/:pid', addProductToCart);

// Ruta para actualizar la cantidad de un producto en el carrito
cartsRouterMSG.put('/:cid/products/:pid', updateProductQuantity);

// Ruta para eliminar un producto de un carrito en DB
cartsRouterMSG.delete('/:cid/product/:pid', removeProductFromCart);

// Ruta para vaciar el carrito
cartsRouterMSG.delete('/:cid/products', deleteDate);

export { cartsRouterMSG };