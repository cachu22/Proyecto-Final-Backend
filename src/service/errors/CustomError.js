import { logger } from "../../utils/logger.js";

export class CustomError {
    static createError({ name = 'Error', cause, message, code = 1 }) {
        const error = new Error(message);
        error.name = name;
        error.code = code;
        error.cause = cause;

        // Registrar la creación del error
        logger.info('Creación de un nuevo error - src/service/errors/CustomError.js:', {
            name,
            code,
            message,
            cause
        });

        throw error;
    }
}

// Error para los carritos
export const CART_ERROR_CODE = 3;