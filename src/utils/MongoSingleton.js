import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from './logger.js';

dotenv.config();

export class MongoSingleton {
    static #instance;

    constructor() {
        // Evitar crear múltiples instancias
        if (MongoSingleton.#instance) {
            return MongoSingleton.#instance;
        }

        // Conectar a MongoDB
        this.connect();

        // Guardar la instancia creada
        MongoSingleton.#instance = this;
    }

    async connect() {
        try {
            const db = await mongoose.connect(process.env.MONGO_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            logger.info('Conectado a la base de datos MongoDB - src/utils/MongoSingleton.js');
            return db;
        } catch (err) {
            logger.error('Error al conectar a la base de datos MongoDB - src/utils/MongoSingleton.js:', err);
            throw new Error('Error al conectar a la base de datos');
        }
    }

    // Método para obtener la instancia del Singleton
    static getInstance() {
        if (!this.#instance) {
            this.#instance = new MongoSingleton();
        }
        return this.#instance;
    }
}