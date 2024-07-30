import jwt from 'jsonwebtoken';
import { PRIVATE_KEY } from '../utils/jwt.js';
import { userService } from '../service/index.js';
import { logger } from '../utils/logger.js';

// Middleware de autorización para administradores y usuarios normales
export function adminOrUserAuth(req, res, next) {
    if (req.session.user) {
        logger.info('Acceso permitido: usuario autenticado en la sesión - Log de /src/middlewares/Auth.middleware.js');
        next(); // Permitir acceso si hay una sesión de usuario válida
    } else {
        logger.warn('Acceso denegado: usuario no autenticado - Log de /src/middlewares/Auth.middleware.js');
        res.status(403).send('Acceso denegado: Debes iniciar sesión');
    }
}

// Middleware de autorización solo para administradores
export function adminAuth(req, res, next) {
    if (req.session?.user?.isAdmin) {
        logger.info('Acceso permitido: usuario es un administrador - Log de /src/middlewares/Auth.middleware.js');
        next(); // Permitir acceso si es un administrador
    } else {
        logger.warn('Acceso denegado: usuario no es administrador - Log de /src/middlewares/Auth.middleware.js');
        res.status(401).send('Acceso no autorizado');
    }
}

export function userAuth(req, res, next) {
    logger.info('Session User - Log de /src/middlewares/Auth.middleware.js:', req.session.user); // Log para verificar la sesión
    if (req.session && req.session.user) {
        logger.info('Acceso permitido: usuario autenticado - Log de /src/middlewares/Auth.middleware.js');
        next();
    } else {
        logger.warn('Acceso denegado: usuario no autenticado - Log de /src/middlewares/Auth.middleware.js');
        res.status(401).send('Acceso no autorizado');
    }
}

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        logger.warn('Token no proporcionado - Log de /src/middlewares/Auth.middleware.js');
        return res.status(401).send({ status: 'error', message: 'Token no proporcionado' });
    }

    jwt.verify(token, PRIVATE_KEY, (err, user) => {
        if (err) {
            logger.error('Token inválido - Log de /src/middlewares/Auth.middleware.js', err);
            return res.status(403).send({ status: 'error', message: 'Token inválido' });
        }
        req.user = user;
        logger.info('Token verificado con éxito - Log de /src/middlewares/Auth.middleware.js');
        next();
    });
};

export const isAuthenticated = (req, res, next) => {
    const token = req.cookies['token'];
    if (!token) {
        logger.warn('No token provided - Log de /src/middlewares/Auth.middleware.js');
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    try {
        logger.info('Token recibido - Log de /src/middlewares/Auth.middleware.js:', token);
        const decoded = jwt.verify(token, PRIVATE_KEY);
        logger.info('Token decodificado - Log de /src/middlewares/Auth.middleware.js:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Verificación de JWT fallida - Log de /src/middlewares/Auth.middleware.js:', error);
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
};