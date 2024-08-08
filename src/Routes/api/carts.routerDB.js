import express from 'express';
import cartController from "../../controllers/cart.controller.js";
import { adminAuth, adminOrUserAuth, userAuth, authenticateToken, authenticateUser, authorizeRoles, preventAdminAddToCart } from "../../middlewares/Auth.middleware.js"

const cartsRouterMSG = express.Router();
const {
    getAll,
    getById,
    create,
    add,
    update,
    remove,
    deleteDate
}= new cartController()

// Ruta para traer todos los carros
cartsRouterMSG.get('/', authenticateToken, adminAuth, getAll);

// Ruta para traer un carro por su id
cartsRouterMSG.get('/:cid', getById);

// Ruta POST para crear un nuevo carrito
cartsRouterMSG.post('/', create);

// Ruta para agregar productos al carrito
cartsRouterMSG.post('/:cid/product/:pid', authenticateToken, preventAdminAddToCart, add);

// Ruta para actualizar la cantidad de un producto en el carrito
cartsRouterMSG.put('/:cid/product/:pid', update);

// Ruta para eliminar un producto de un carrito en DB
cartsRouterMSG.delete('/:cid/product/:pid', remove);

// Ruta para vaciar el carrito
cartsRouterMSG.delete('/:cid/products', deleteDate);

export { cartsRouterMSG };