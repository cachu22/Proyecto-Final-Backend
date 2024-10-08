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
                    message: 'Carrito no encontrado'
                });
            }

            // Arrays para manejar los productos comprados y los no comprados
            const productsNotPurchased = [];
            const purchasedProducts = [];
            let totalPrice = 0;

            // Comprobar la disponibilidad de cada producto en el carrito
            for (const item of cart.products) {
                const product = item.product;
                const quantity = item.quantity;
                const stock = await productService.getProductStock(product._id);

                if (quantity > stock) {
                    // Si no hay suficiente stock, agregar el ID del producto a la lista de no comprados
                    productsNotPurchased.push(item);
                } else {
                    // Si hay suficiente stock, restar la cantidad comprada del stock del producto
                    await productService.updateProductStock(product._id, stock - quantity);
                    purchasedProducts.push(item);
                    totalPrice += item.product.price * item.quantity;
                }
            }

            // Crear el ticket con los productos que sí se pudieron comprar
            const ticket = await ticketService.createTicket({
                user: req.user,
                products: purchasedProducts,
                totalPrice
            });

            // Actualizar el carrito del usuario para que solo contenga los productos no comprados
            await cartService.updateCartProducts(cid, productsNotPurchased);

            res.status(200).json({
                status: 'success',
                message: 'Compra realizada con éxito. Algunos productos no pudieron comprarse por falta de stock.',
                productsNotPurchased: productsNotPurchased.map(item => item.product._id), // Devolver los IDs de los productos no comprados
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