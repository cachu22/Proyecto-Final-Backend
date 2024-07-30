import { logger } from "../../utils/logger.js";

export const generateUserError = (user) => {
    const errorMessage = `Hay una de las propiedades del usuario incompleta o no valida.
    Listado de propiedades requeridos:
    *first_name: necesita ser un string, pero se recibió ${user.first_name}
    *last_name: necesita ser un string, pero se recibió ${user.last_name}
    *email: necesita ser un string, pero se recibió ${user.email}
    `;
    logger.error('Error en la creación de usuario - src/service/errors/info.js:', errorMessage);
    return errorMessage;
}

export const addProductError = (Product) => {
    const errorMessage = `Uno de los campos es erroneo o no se encuentra.
    Los requerimientos son:
    *title: Necesita ser un string, pero se recibió ${Product.title}
    *model: Necesita ser un string, pero se recibió ${Product.model}
    *description: Necesita ser un string, pero se recibió ${Product.description}
    *price: Necesita ser un number, pero se recibió ${Product.price}
    *thumbnails: Necesita ser un string, pero se recibió ${Product.thumbnails}
    *stock: Necesita ser un number, pero se recibió ${Product.stock}
    *category: Necesita ser un string, pero se recibió ${Product.category}
    `;
    logger.error('Error en la adición del producto - src/service/errors/info.js:', errorMessage);
    return errorMessage;
}

export const addProductToCartError = (productId, cartId, errorDetails) => {
    const errorMessage = `Error al agregar el producto con ID ${productId} al carrito con ID ${cartId}.
    Detalles del error: ${errorDetails}`;
    logger.error('Error al agregar producto al carrito - src/service/errors/info.js:', errorMessage);
    return errorMessage;
}