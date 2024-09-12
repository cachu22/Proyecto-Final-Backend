import { Router } from "express";
import fs from 'fs';
import { __dirname } from "../utils/utils.js";
import { multerSingleUploader } from "../utils/multer.js";
import CartDaoMongo from "../daos/MONGO/MONGODBNUBE/cartsDao.mongo.js";
import { adminOrUserAuth, adminAuth, authenticateToken, authenticateUser, authorizeRoles } from "../middlewares/Auth.middleware.js";
import { ProductService, userService } from "../service/index.js";
import { logger } from "../utils/logger.js";
import { CartService } from "../service/index.js";
import ProductController from "../controllers/product.controller.js";

// Cargar los datos de productos localfile
const productsData = JSON.parse(fs.readFileSync(__dirname + '/file/products.json', 'utf-8'));

// Asigna los datos de productos existentes a la variable `products`
let products = productsData;

const viewsRouter = new Router();
const manager = new CartDaoMongo();

viewsRouter.get('/', async (req, res) => {
    const { numPage, limit } = req.query;
    try {
        const { docs, page, hasPrevPage, hasNextPage, prevPage, nextPage } = await ProductService.getAll({ limit, numPage });

        const user = req.session.user || {};
        console.log('User from session:', user); // Depurar la información del usuario

        const isAdmin = user.role === 'admin';
        const isPremium = user.role === 'premium';
        const isAdminOrPremium = isAdmin || isPremium;

        console.log('isAdmin:', isAdmin); // Para depuración
        console.log('isPremium:', isPremium); // Para depuración
        console.log('isAdminOrPremium:', isAdminOrPremium); // Para depuración

        res.render('home', {
            products: docs,
            page,
            hasPrevPage,
            hasNextPage,
            prevPage,
            nextPage,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            isAdmin,
            isPremium,
            isAdminOrPremium
        });

        logger.info('Página principal renderizada con productos - src/Routes/views.router.js', { products: docs });
    } catch (error) {
        logger.error('Error al obtener los productos - src/Routes/views.router.js:', error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// Ruta para agregar un nuevo producto DB
// Controlador de ruta para agregar un nuevo producto
async function addProduct(req, res) {
    const newProductData = req.body;
    try {
        const newProduct = await productService.create(newProductData);
        res.status(201).json(newProduct); // Respuesta con el nuevo producto creado

        logger.info('Nuevo producto agregado - src/Routes/views.router.js:', { newProduct });
    } catch (error) {
        logger.error('Error al agregar el producto - src/Routes/views.router.js:', error);
        res.status(500).json({ error: error.message }); // Manejo de errores
    }
}

viewsRouter.get('/login', (req, res) => {
    res.render('login');
    logger.info('Página de login renderizada - src/Routes/views.router.js');
});

viewsRouter.get('/current', (req, res) => {
    res.render('current');
    logger.info('Página de información del usuario actual renderizada - src/Routes/views.router.js');
});

viewsRouter.get('/check-session', (req, res) => {
    res.json(req.session.user);
    logger.info('Verificación de sesión realizada - src/Routes/views.router.js', { sessionUser: req.session.user });
});

// Ruta usando adminAuth
viewsRouter.get('/admin/products', adminAuth, (req, res) => {
    res.render('admin-products', {
        first_name: req.session.user.first_name,
        last_name: req.session.user.last_name,
        isAdmin: req.session.user.isAdmin
    });
    logger.info('Página de productos de administración renderizada - src/Routes/views.router.js', { user: req.session.user });
});

// Ruta para la bienvenida (Datos del cliente)
viewsRouter.get('/welcome', adminOrUserAuth, (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    res.render('home', {
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName
    });
    logger.info('Página de bienvenida renderizada para el usuario - src/Routes/views.router.js', { user: req.session.user });
});

viewsRouter.get('/register', (req, res) => {
    res.render('register');
    logger.info('Página de registro renderizada - src/Routes/views.router.js');
});

viewsRouter.get('/GestionProductos', (req, res, next) => {
    if (req.session?.user?.role === 'admin' || req.session?.user?.role === 'premium') {
        logger.info('Acceso permitido: usuario es admin o premium - Log de src/Routes/views.router.js');
        next(); // Permitir acceso si es admin o premium
    } else {
        logger.warning('Acceso denegado: usuario no es admin ni premium - Log de src/Routes/views.router.js');
        res.status(401).send('Acceso no autorizado');
    }
}, (req, res) => {
    res.render('GestionDeProductos');
    logger.info('Página de gestión de productos renderizada para el usuario - src/Routes/views.router.js', { user: req.session.user });
});

// Ruta para gestión de usuarios (disponible solo para administradores)
viewsRouter.get('/gestionDeUsuarios', (req, res, next) => {
    if (req.session?.user?.role === 'admin') {
        logger.info('Acceso permitido: usuario es admin - Log de src/Routes/views.router.js');
        next(); // Permitir acceso si es admin
    } else {
        logger.warning('Acceso denegado: usuario no es admin - Log de src/Routes/views.router.js');
        res.status(401).send('Acceso no autorizado');
    }
}, (req, res) => {
    res.render('gestionDeUsuarios');
    logger.info('Página de gestión de usuarios renderizada para el usuario - src/Routes/views.router.js', { user: req.session.user });
});


// viewsRouter.get('/realtimeproducts', adminOrUserAuth, (req, res) => {
//     res.render('realTimeProducts', { products: productsData });
//     logger.info('Página de productos en tiempo real renderizada - src/Routes/views.router.js', { products: productsData });
// });
const productController = new ProductController()

viewsRouter.get('/realtimeproducts', adminOrUserAuth, async (req, res) => {
    try {

        const products = await productController.getAll();
        const plainProducts = products.map(product => product.toObject()); // Convertir a objetos simples
        res.render('realTimeProducts', { products: plainProducts });
        logger.info('Página de productos en tiempo real renderizada - src/Routes/views.router.js', { products: plainProducts });
    } catch (error) {
        logger.error('Error al obtener productos', error);
        res.status(500).send('Error al obtener productos');
    }
});

// viewsRouter.get('/cart', adminOrUserAuth, (req, res) => {
//     const cartToShow = cartData.find(cart => cart['id de carrito'] === 3);

//     if (!cartToShow) {
//         res.status(404).send('El carrito no fue encontrado');
//         logger.warn('Carrito no encontrado - src/Routes/views.router.js', { cartId: 3 });
//         return;
//     }

//     const cartInfo = {
//         id: cartToShow['id de carrito'],
//         products: cartToShow.products.map(product => ({
//             id: product['id de producto'],
//             quantity: product.quantity,
//             thumbnails: product.thumbnails
//         }))
//     };

//     res.use('realTimeProducts', { cart: cartInfo });
//     logger.info('Carrito mostrado - src/Routes/views.router.js', { cart: cartInfo });
// });

viewsRouter.get('/cart/:cid', adminOrUserAuth, async (req, res) => {
    try {
        const cartId = req.params.cid;

        // Obtén el carrito utilizando el servicio
        const cartToShow = await CartService.getById(cartId);

        if (!cartToShow) {
            res.status(404).send('El carrito no fue encontrado');
            logger.warn('Carrito no encontrado - src/Routes/views.router.js', { cartId });
            return;
        }

        // Calcula el totalPrice
        const totalPrice = cartToShow.products.reduce((sum, product) => {
            return sum + (product.product.price * product.quantity);
        }, 0);

        const cartInfo = {
            _id: cartToShow.id,
            products: cartToShow.products.map(product => ({
                _id: product.product._id,
                quantity: product.quantity,
                thumbnails: product.product.thumbnails[0],
                title: product.product.title,
                description: product.product.description,
                price: product.product.price
            })),
            totalPrice: totalPrice 
        };

        res.render('cart', { cart: cartInfo });
        logger.info('Carrito mostrado - src/Routes/views.router.js', { cart: cartInfo });
    } catch (error) {
        res.status(500).send('Error al obtener el carrito');
        logger.error('Error al obtener el carrito - src/Routes/views.router.js', { error });
    }
});

// // Ruta para mostrar la vista de un carrito específico
// viewsRouter.get('/carts/:cid', adminOrUserAuth, async (req, res) => {
//     const { cid } = req.params;
//     try {
//         logger.info('ID del carrito - src/Routes/views.router.js:', cid); // Log para verificar el ID del carrito
//         const result = await manager.getCartById(cid);
//         logger.info('Datos del carrito - src/Routes/views.router.js:', result); // Log para verificar los datos del carrito

//         if (!result) {
//             res.status(404).send({ status: 'error', message: 'No se encontró el ID especificado' });
//             logger.warn('Carrito no encontrado por ID - src/Routes/views.router.js', { cartId: cid });
//         } else {
//             // Convertir el resultado a un objeto plano
//             const cart = result.toObject();
//             const products = cart.products || [];
//             res.render('cart', { cartId: cid, cart, products });
//             logger.info('Carrito renderizado - src/Routes/views.router.js', { cartId: cid, cart });
//         }
//     } catch (error) {
//         logger.error('Error al buscar el carrito por ID - src/Routes/views.router.js:', error);
//         res.status(500).send({ status: 'error', message: 'Error al buscar el carrito por ID' });
//     }
// });

// Ruta para subir la imagen utilizando multer
viewsRouter.post('/upload-file', multerSingleUploader, adminOrUserAuth, (req, res) => {
    // Log de imagen subida
    logger.info('Imagen subida con éxito - src/Routes/views.router.js', { file: req.file });
    res.send('¡Imagen subida con éxito!');
});

// // Ruta para agregar un nuevo producto
// viewsRouter.post('/realtimeproducts', adminOrUserAuth, addProduct);

// Ruta para agregar un nuevo producto
viewsRouter.post('/realtimeproducts', adminOrUserAuth, addProduct);

//Ruta para el restablecimiento de contraseña
// routes/auth.routes.js
viewsRouter.get('/forgot', (req, res) => {
    res.render('forgot');
});

viewsRouter.get('/reset/:token', async (req, res) => {
    const { token } = req.params;
    
    try {
        logger.info(`Received request to reset password with token: ${token}`);
        
        const user = await userService.getUserInfo({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        
        if (!user) {
            logger.warn(`Password reset token is invalid or has expired for token: ${token}`);
            return res.status(400).send('Password reset token is invalid or has expired.');
        }
        
        // Renderiza una vista donde el usuario puede ingresar una nueva contraseña
        res.render('reset', { token });
    } catch (error) {
        logger.error('Error processing password reset request:', error);
        res.status(500).send('Error processing request');
    }
});

export default viewsRouter;