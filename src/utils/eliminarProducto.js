import { logger } from "./logger.js";

// Función para eliminar un producto
export function deleteProduct(pid, manager, io) {
    try {
        logger.info('Intentando eliminar el producto con ID - src/utils/eliminarProducto.js:', pid); // Log de inicio de eliminación

        // Llama a la función deleteProduct del productManager y pasa el pid
        manager.deleteProduct(pid);

        // Después de eliminar el producto, cargar la lista de productos actualizada
        const updatedProducts = manager.getProducts();

        // Emitir un evento al cliente con la lista actualizada de productos
        io.emit('productosActualizados', updatedProducts);

        logger.info('Producto eliminado correctamente, lista de productos actualizada enviada al cliente - src/utils/eliminarProducto.js'); // Log de éxito

    } catch (error) {
        logger.error('Error al eliminar el producto - src/utils/eliminarProducto.js:', error); // Log de error
        // Si hay un error, puedes emitir un evento de error al cliente para manejarlo en el frontend
        io.emit('eliminarProductoError', { pid, error: error.message });
    }
}