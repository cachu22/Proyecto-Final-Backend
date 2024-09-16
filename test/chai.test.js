import { expect } from 'chai';
import mongoose from 'mongoose';
import dotenv from 'dotenv';  // Para cargar variables de entorno
import UserDaoMongo from '../src/daos/MONGO/MONGODBNUBE/usersDao.mongo.js';
import MongoSingleton from '../src/utils/MongoSingleton.js';

dotenv.config();  // Carga las variables del .env

describe('Test de users Dao', () => {
    before(async function () {
        // Asegúrate de que la base de datos esté conectada antes de las pruebas
        await MongoSingleton.connect();
        this.userDao = new UserDaoMongo();
    });

    beforeEach(async function () {
        // Limpiar la colección antes de cada prueba
        const collections = mongoose.connection.collections;
        if (collections.users) {
            await collections.users.drop();
        }
        this.timeout(5000); // Extiende el tiempo de espera si es necesario
    });

    it('Debe obtener todos los usuarios', async function () {
        const result = await this.userDao.getAll();
        expect(Array.isArray(result)).to.be.equals(true);  // Verifica que el resultado sea un array
    });
});