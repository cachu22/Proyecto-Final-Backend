import { EError } from "../../service/errors/enums.js";
import { logger } from "../../utils/logger.js";

export const handleErrors = () => (error, req, res, next) => {
    // Registrar el error completo
    logger.error('Error - Log de /src/middlewares/errors/index.js:', error.message);
    logger.error('Causa del error:', error.cause);

    let statusCode = 500; // Default to Internal Server Error
    let errorMessage = 'Error no identificado';

    switch (error.code) {
        case EError.INVALID_TYPES_ERROR:
            statusCode = 400; // Bad Request
            errorMessage = 'Tipo de datos inválido';
            break;
        case EError.DATABASE_ERROR:
            statusCode = 500; // Internal Server Error
            errorMessage = 'Error en la base de datos';
            break;
        default:
            errorMessage = 'Error sin motivo alguno xD';
            break;
    }

    // Responder con el código de estado y el mensaje de error
    res.status(statusCode).json({ status: 'error', error: errorMessage, code: error.code });
};