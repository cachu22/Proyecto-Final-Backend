import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import { createServer } from 'http';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';

import { initializePassport } from './config/passport.config.js';
import { connectDb, objectConfig } from './config/index.js';
import routerApp from './Routes/index.js';
import viewsRouter from './Routes/views.router.js';
import clientMensajeria from './Routes/api/clientMessage.js';
import { multerSingleUploader } from './utils/multer.js';
import { handleAddProduct } from './utils/crear.js';
import { deleteProduct } from './utils/eliminarProducto.js';
import ProductDaoFS from './daos/MONGO/MONGODBLOCAL/productDao.FS.js';
import { productsSocket } from './utils/productsSocket.js';
import { handleErrors } from './middlewares/errors/index.js';
import { addLogger, logger } from './utils/logger.js';

import swaggerJsDoc from 'swagger-jsdoc'
import swaggerUiExpress from 'swagger-ui-express';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

logger.info("Inicializando servidor... - /server.js");

const cartData = JSON.parse(fs.readFileSync(__dirname + '/file/carts.json', 'utf-8'));

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const { port } = objectConfig;

logger.info("Conectando a la base de datos... - /server.js");
connectDb().then(() => {
    logger.info('Conectado a la base de datos archivo server - /server.js');
}).catch(error => {
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

const specs = swaggerJsDoc(swaggerOptions)
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'Public')))
app.use(cookieParser());
initializePassport();
app.use(passport.initialize());

const mode = process.argv[2] === '--mode' && process.argv[3] ? process.argv[3] : 'development';
logger.info("Modo de ejecución - /server.js:", mode);

const envFilePath = `.env.${mode}`;
dotenv.config({ path: envFilePath });

app.use(cors());
app.use(addLogger);

logger.info("Configurando sesiones con MongoDB - /server.js...");
app.use(session({
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/ecommerce',
        ttl: 60 * 60 * 1000 * 24
    }),
    secret: 's3cr3etc@d3r',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
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

io.on('connection', (socket) => {
    logger.info('Nuevo cliente conectado - /server.js');

    socket.on('message', (data) => {
        logger.info('Mensaje recibido - /server.js:', data);
        io.emit('message', data);
    });

    socket.on('disconnect', () => {
        logger.info('Cliente desconectado - /server.js');
    });

    socket.on('addProduct', (productData) => {
        handleAddProduct(productData, manager, io);
        logger.info('Datos recibidos desde el cliente - /server.js', productData);
    });

    socket.on('eliminarProducto', (productId) => {
        deleteProduct(productId, manager, io);
        logger.info('Producto eliminado - /server.js:', productId);
    });
});

export const getServer = () => httpServer.listen(port, error => {
    if (error) {
        logger.error("Error al iniciar el servidor - /server.js:", error);
    } else {
        logger.info('Servidor escuchando en el puerto - /server.js' + port);
    }
});

logger.info("Servidor inicializado - /server.js");

app.use((err, req, res, next) => {
    console.error('Error manejado por el manejador de errores:', err);
    res.status(500).json({ status: 'error', message: err.message });
});

getServer();