import { connect } from 'mongoose';
import { logger } from './logger.js';

export class MongoSingleton {
    static #instance;

    constructor() {
                //En caso de querer conectar con la base en la nube
        // connect('mongodb+srv://ladrianfer87:u7p7QfTyYPoBhL9j@cluster0.8itfk8g.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0')

                //En caso de querer conectar con la base local
        connect('mongodb://127.0.0.1:27017/ecommerce')

            .then(() => {
                logger.info('Conectado a la base de datos MongoDB - src/utils/MongoSingleton.js');
            })
            .catch(err => {
                logger.error('Error al conectar a la base de datos MongoDB - src/utils/MongoSingleton.js:', err);
            });
    }

    static getInstance() {
        if (this.#instance) {
            logger.info('La base de datos ya se encuentra conectada - src/utils/MongoSingleton.js');
            return this.#instance;
        }
        this.#instance = new MongoSingleton();
        logger.info('Base de datos conectada - src/utils/MongoSingleton.js');
        return this.#instance;
    }
}