import { logger } from "./logger.js";

export const productsSocket = (socketServer) => {
    return (req, res, next) => {
        req.socketServer = socketServer;
        logger.info('Servidor de sockets asignado a la solicitud - src/utils/productSocket.js');
        return next();
    }
};