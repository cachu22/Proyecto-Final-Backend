import jwt from 'jsonwebtoken';
import { PRIVATE_KEY } from '../utils/jwt.js';
import { userService } from '../service/index.js';
import { logger } from '../utils/logger.js';
import { objectConfig } from '../config/index.js';
import { ProductService } from '../service/index.js';

const productService = ProductService

// Middleware de autorización para administradores y usuarios normales
export function adminOrUserAuth(req, res, next) {
    if (req.session.user) {
        logger.info('Acceso permitido: usuario autenticado en la sesión - Log de /src/middlewares/Auth.middleware.js');
        next(); // Permitir acceso si hay una sesión de usuario válida
    } else {
        logger.warning('Acceso denegado: usuario no autenticado - Log de /src/middlewares/Auth.middleware.js');
        res.status(403).send('Acceso denegado: Debes iniciar sesión');
    }
}

// Middleware de autorización solo para administradores
export const adminAuth = (req, res, next) => {
    if (typeof res.status !== 'function') {
        console.error('res no es un objeto de respuesta de Express');
        return next(new Error('Invalid response object'));
    }

    const userRole = req.user && req.user.role;
    if (!userRole || userRole !== 'admin') {
        console.error('Error en adminAuth:', req.user);
        return res.status(403).json({ status: 'error', message: 'No tiene permisos para realizar esta acción' });
    }

    console.log('Rol del usuario autorizado:', userRole);
    next();
};

// Middleware de autorización solo para usuario Premium
export function premiumAuth(req, res, next) {
    if (req.session?.user?.role === 'premium') {
        logger.info('Acceso permitido: usuario es premium - Log de /src/middlewares/Auth.middleware.js');
        next(); // Permitir acceso si es premium
    } else {
        logger.warning('Acceso denegado: usuario no es premium - Log de /src/middlewares/Auth.middleware.js');
        res.status(401).send('Acceso no autorizado');
    }
}

export function userAuth(req, res, next) {
    logger.info('Session User - Log de /src/middlewares/Auth.middleware.js:', req.session.user); // Log para verificar la sesión
    if (req.session && req.session.user) {
        logger.info('Acceso permitido: usuario autenticado - Log de /src/middlewares/Auth.middleware.js');
        next();
    } else {
        logger.warning('Acceso denegado: usuario no autenticado - Log de /src/middlewares/Auth.middleware.js');
        res.status(401).send('Acceso no autorizado');
    }
}


export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ status: 'error', message: 'Token no proporcionado' });

    jwt.verify(token, objectConfig.jwt_private_key, (err, user) => {
        if (err) return res.status(403).json({ status: 'error', message: 'Token inválido' });

        // Almacena el usuario en `req.user`
        req.user = user;

        // Para depuración (opcional)
        console.log('Datos del authHeader:', authHeader);
        console.log('Datos del token:', token);
        console.log('Datos de req.user:', req.user);
        
        next();
    });
};

// Middleware para evitar que los usuarios admin agreguen productos a los carritos
export const preventAdminAddToCart = async (req, res, next) => {
    const userRole = req.session.user?.role;
    const userId = req.session.user?._id;


    
    if (userRole === 'admin') {
        const errorMessage = 'Los usuarios admin no pueden agregar productos al carrito.';
        logger.error('Log de /src/middlewares/preventAdminAddToCart.js', errorMessage);
        return res.status(403).json({ status: 'error', message: errorMessage });
    }

    try {
        const product = await productService.getOne(req.params.pid);
        logger.info('Información del producto', {
            product,
            productOwner: product.owner.toString()
        });

        if (userRole === 'premium' && product.owner.toString() === userId.toString()) {
            const errorMessage = 'No puedes agregar tu propio producto a tu carrito.';
            logger.error('Log de /src/middlewares/preventAdminAddToCart.js', errorMessage);
            return res.status(403).json({ status: 'error', message: errorMessage });
        }

        next();
    } catch (error) {
        logger.error('Error al verificar el producto en preventAdminAddToCart', error);
        res.status(500).json({ status: 'error', message: 'Error al verificar el producto', error: error.message });
    }
};

export const isAuthenticated = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        logger.warning('No token provided');
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1]; // Obtener el token después de 'Bearer '
    if (!token) {
        logger.warning('No token found in header');
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    try {
        logger.info('Token recibido:', token);
        const decoded = jwt.verify(token, objectConfig.jwt_private_key);
        logger.info('Token decodificado:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Verificación de JWT fallida:', error);
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
};

export const authenticateUser = async (req, res, next) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'Usuario no autenticado' });
        }

        const user = await userService.getUser(userId);
        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Usuario no encontrado' });
        }

        console.log('Usuario encontrado:', user);
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error en la autenticación del usuario', error: error.message });
    }
};

export const authorizeRoles = (req, res, next) => {
    if (typeof res.status !== 'function') {
        console.error('res no es un objeto de respuesta de Express');
        return next(new Error('Invalid response object'));
    }

    const userRole = req.user && req.user.role;
    if (!userRole || (userRole !== 'admin' && userRole !== 'premium')) {
        console.error('Error en authorizeRoles:', req.user);
        return res.status(403).json({ status: 'error', message: 'No tiene permisos para realizar esta acción' });
    }

    console.log('Rol del usuario autorizado:', userRole);
    next();
};