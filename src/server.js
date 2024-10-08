import dotenv from 'dotenv';
const mode = process.argv[2] === '--mode' && process.argv[3] ? process.argv[3] : 'development';
const envFilePath = `.env.${mode}`;
dotenv.config({ path: envFilePath });

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { engine } from 'express-handlebars';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import fs from 'fs';
import { initializePassport } from './config/passport.config.js';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';
import { multerSingleUploader } from './utils/multer.js';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { connectDb, objectConfig } from './config/index.js';
import { handleErrors } from './middlewares/errors/index.js';
import { addLogger, logger } from './utils/logger.js';
import ProductDaoFS from './daos/MONGO/MONGODBLOCAL/productDao.FS.js';
import routerApp from './Routes/index.js';
import viewsRouter from './Routes/views.router.js';
import clientMensajeria from './Routes/api/clientMessage.js';
import jwt from 'jsonwebtoken';
import { saveMessage } from './controllers/messaje.controller.js';
import ProductController from './controllers/product.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

logger.info("Inicializando servidor... - /server.js");

const cartData = JSON.parse(fs.readFileSync(__dirname + '/file/carts.json', 'utf-8'));

const app = express();
const httpServer = http.createServer(app);
export const io = new Server(httpServer, {
    cors: {
        origin: '*', // Permite todos los orígenes
        methods: ['GET', 'POST', 'DELETE'],
        credentials: true
    }
});

const productController = new ProductController(io);

const port = process.env.PORT || 5000;

logger.info("Conectando a la base de datos... - /server.js");
connectDb()
    .then(() => {
        logger.info('Conectado a la base de datos archivo server - /server.js');
    })
    .catch(error => {
        logger.error('Error al conectar a la base de datos archivo server - /server.js:', error);
        process.exit(1);
    });

const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentación de app para la ecommerce',
            description: 'API para documentar app de comercio'
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [`${__dirname}/docs/**/*.yaml`],
};

const specs = swaggerJsDoc(swaggerOptions);
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'Public')));
app.use(cookieParser());
initializePassport();
app.use(passport.initialize());

logger.info("Modo de ejecución - /server.js:", mode);

app.use(cors());
app.use(addLogger);

const connection = mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Conexión a la base de datos exitosa'))
    .catch((err) => console.error('Error al conectar a la base de datos:', err));

logger.info("Configurando sesiones con MongoDB - /server.js...");
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        ttl: 60 * 60 * 1000 * 24,
        autoRemove: 'native'
    }).on('error', (err) => {
        logger.error('Error al configurar las sesiones con MongoDB:', err);
    }),
    secret: process.env.JWT_PRIVATE_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production' && process.env.USE_HTTPS === 'true',
        maxAge: 60 * 60 * 1000 * 24,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    }
}));

app.use(routerApp);
app.use(handleErrors());
app.use(passport.session());

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    helpers: {
        eq: (a, b) => a === b
    }
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

logger.info("Configuración de vistas y motor de plantillas establecida - /server.js");

app.use('/', viewsRouter);
app.use('/realtimeproducts', viewsRouter);
app.use('/cart', viewsRouter);
app.use('/mensajes', clientMensajeria);

app.use('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { products: productsData });
});

app.post('/upload-file', multerSingleUploader, (req, res) => {
    res.send('¡Imagen subida con éxito!');
});

logger.info("Rutas configuradas - /server.js");

app.get('/api/config', (req, res) => {
    res.json({ port: objectConfig.port });
    logger.info("Configuración enviada - /server.js:", objectConfig.port);
});

const manager = new ProductDaoFS(`${__dirname}/file/products.json`);
logger.info("Gestor de productos inicializado - /server.js");

// Middleware para autenticación con Socket.IO
io.use((socket, next) => {
    const token = socket.handshake.query.token;

    if (!token) {
        return next(new Error('Authentication error: Token no proporcionado'));
    }

    jwt.verify(token, objectConfig.jwt_private_key, (err, user) => {
        if (err) {
            return next(new Error('Authentication error: Token inválido'));
        }

        // Almacena el usuario en `socket.user`
        socket.user = user;
        next();
    });
});

// Manejo de conexiones
io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('message', async (data) => {
        const { user, message } = data;
        if (user && message) {
            try {
                await saveMessage(user, message);
                io.emit('message', data); // Emitir el mensaje a todos los clientes
            } catch (error) {
                console.error('Error al guardar el mensaje:', error.message);
            }
        } else {
            console.error('Mensaje recibido del servidor es inválido - Log de /server.js:', { user, message });
        }
    });

    socket.on('productAdded', (product) => {
        console.log('Producto agregado:', product);
    });

    // Manejo de desconexión
    socket.on('disconnect', () => {
        logger.info('Cliente desconectado', { id: socket.id });
    });
});

// Exportar app para utilizarlo en supertest
export { app };

export const getServer = () => httpServer.listen(port, error => {
    if (error) {
        logger.error("Error al iniciar el servidor - /server.js:", error);
    } else {
        logger.info(`Servidor escuchando en el puerto - /server.js ${port}`);
    }
});

logger.info("Servidor inicializado - /server.js");

app.use((err, req, res, next) => {
    console.error('Error manejado por el manejador de errores:', err);
    res.status(500).json({ status: 'error', message: err.message });
});

getServer();

// Funciones de validación
function validateMessage(message) {
    // Implementa la lógica de validación del mensaje
    return message && typeof message.text === 'string';
}