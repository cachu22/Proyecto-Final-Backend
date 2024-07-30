import dotenv from 'dotenv';
import { program } from '../utils/commander.js';
import { MongoSingleton } from '../utils/MongoSingleton.js';
import { logger } from '../utils/logger.js';

// Cargar las variables de entorno
const { mode } = program.opts();
dotenv.config({
    path: mode === 'production' ? './.env.production' : './.env.development'
});

// Configuración del objeto de configuración
export const objectConfig = {
    port: process.env.PORT || 8000,
    mongo_uri: process.env.MONGO_URI,
    jwt_private_key: process.env.JWT_PRIVATE_KEY,
    persistence: process.env.PERSISTENCE,
    gmail_user: process.env.GMAIL_USER,
    gmail_pass: process.env.GMAIL_PASS,
    twilio_sid: process.env.TWILIO_ACCOUNT_SID,
    twilio_token: process.env.TWILIO_AUTH_TOKEN,
    twilio_phone: process.env.TWILIO_PHONE
};

// Función para conectar a la base de datos
export const connectDb = async () => {
    try {
        logger.info('Iniciando conexión a la base de datos con URI - Log de /src/config/index.js:', objectConfig.mongo_uri);
        MongoSingleton.getInstance(objectConfig.mongo_uri);
        logger.info('Conexión a la base de datos establecida correctamente - Log de /src/config/index.js');
    } catch (error) {
        logger.error('Error al conectar a la base de datos - Log de /src/config/index.js:', error);
    }
};

// Llamada a la función de conexión para asegurarse de que la base de datos esté conectada
// connectDb();