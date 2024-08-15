import { expect } from 'chai';
import mongoose from 'mongoose';
import UserDaoMongo from '../src/daos/MONGO/MONGODBNUBE/usersDao.mongo.js';

mongoose.connect('mongodb://127.0.0.1:27017/ecommerce');

describe('Test de users Dao', () => {
    before(function () {
        this.userDao = new UserDaoMongo();
    });

    beforeEach(function () {
        mongoose.connection.collections.users.drop();
        this.timeout(5000);
    });

    it('Debe obtener todos los usuarios', async function () {

        const result = await this.userDao.getAll();
        // expect(result).to.be.deep.equal([]);
        // expect(result).deep.equal([])
        // expect(Array.isArray(result)).to.be.ok
        expect(Array.isArray(result)).to.be.equals(true)
    });
});