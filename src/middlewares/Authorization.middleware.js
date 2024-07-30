import { logger } from "../utils/logger.js";

export const authorization = role => {
    return async (req, res, next) => {
        if (!req.user) {
            logger.warn('Acceso no autorizado: usuario no autenticado - Log de /src/middlewares/Authorization.middleware.js');
            return res.status(401).send({ status: 'error', error: 'Unauthorized' });
        }
        if (req.user.role !== role) {
            logger.warn(`Acceso denegado: el usuario con rol ${req.user.role} no tiene permisos para ${role} - Log de /src/middlewares/Authorization.middleware.js`);
            return res.status(403).send({ status: 'error', error: 'not permissions' });
        }
        logger.info(`Acceso autorizado: el usuario con rol ${req.user.role} tiene permisos para ${role} - Log de /src/middlewares/Authorization.middleware.js`);
        next();
    }
};