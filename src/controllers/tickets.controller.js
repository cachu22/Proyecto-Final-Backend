import { cartService, productService, ticketService } from "../service";
import { logger } from "../utils/logger.js";

class TicketController {

    TicketPost = async (req, res) => {
        const { cid } = req.params;
        
        try {
            // Obtener el carrito
            const cart = await cartService.getCart(cid);
            if (!cart) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Cart not found'
                });
            }

            // Array de IDs de productos que no se pudieron comprar
            const productsNotPurchased = [];

            // Comprobar la disponibilidad de cada producto en el carrito
            for (const item of cart.products) {
                const product = item.product;
                const quantity = item.quantity;
                const stock = await productService.getProductStock(product._id);

                if (quantity > stock) {
                    // Si no hay stock, agregar el ID del producto a la lista de no comprados
                    productsNotPurchased.push(product._id);
                } else {
                    // Si hay suficiente stock, restar la cantidad comprada del stock del producto
                    await productService.updateProductStock(product._id, stock - quantity);
                }
            }

            // Crear el ticket con los datos de la compra
            const ticket = await ticketService.createTicket({
                user: req.user,
                products: cart.products,
                totalPrice: cart.totalPrice
            });

            // Si hay productos no comprados, actualizar el carrito para quitarlos
            if (productsNotPurchased.length > 0) {
                await cartService.updateCartProducts(cid, cart.products.filter(item => !productsNotPurchased.includes(item.product._id)));
            } else {
                // Si todos los productos se pudieron comprar, vaciar el carrito
                await cartService.emptyCart(cid);
            }

            res.status(200).json({
                status: 'success',
                message: 'Purchase completed successfully',
                productsNotPurchased,
                ticket
            });
        } catch (error) {
            logger.error("Error en el proceso de compra - Log de /src/controllers/tickets.controller.js:", error);
            res.status(500).json({
                status: 'error',
                message: 'Error en el proceso de compra'
            });
        }
    }
}

export default TicketController;