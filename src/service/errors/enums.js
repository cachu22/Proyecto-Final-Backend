import { logger } from "../../utils/logger.js";

export const EError = {
    ROUTING_ERROR: 1,
    INVALID_TYPES_ERROR: 2,
    DATABASE_ERROR: 3
}

// Función para registrar el uso de un tipo de error
export const logErrorType = (errorType) => {
    switch (errorType) {
        case EError.ROUTING_ERROR:
            logger.error('Tipo de error: ROUTING_ERROR - src/service/errors/enum.js');
            break;
        case EError.INVALID_TYPES_ERROR:
            logger.error('Tipo de error: INVALID_TYPES_ERROR - src/service/errors/enum.js');
            break;
        case EError.DATABASE_ERROR:
            logger.error('Tipo de error: DATABASE_ERROR - src/service/errors/enum.js');
            break;
        default:
            logger.error('Tipo de error desconocido:', errorType);
    }
}