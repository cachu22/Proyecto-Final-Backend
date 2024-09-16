import UserDaoMongo from '../src/daos/MONGO/MONGODBNUBE/usersDao.mongo.js';
import assert from 'assert';
import dotenv from 'dotenv';  // Para cargar variables de entorno
import MongoSingleton from '../src/utils/MongoSingleton.js';

dotenv.config();  // Carga las variables del .env

describe('Test users Dao', function() {
    let userDao;
    let testUserId;

    before(async function() {
        this.timeout(5000); // Extiende el tiempo de espera si es necesario
        // Conectar a MongoDB usando MongoSingleton
        await MongoSingleton.connect();
        this.userDao = new UserDaoMongo();
    });

    beforeEach(async function() {
        this.timeout(5000);
        // Limpiar la colección antes de cada prueba
        await mongoose.connection.collection('users').deleteMany({});
    });

    after(async function() {
        // Limpiar después de todas las pruebas
        await mongoose.connection.collection('users').deleteMany({});
        mongoose.connection.close();
    });

    it('Debe crear un nuevo usuario', async function() {
        const user = { first_name: 'John Doe', email: 'john@example.com', password: 'password123' };
        const result = await this.userDao.create(user);
        assert.ok(result._id);
        assert.strictEqual(result.first_name, user.first_name);
        testUserId = result._id; // Guardar el ID para usarlo en otras pruebas
    });

    it('Debe obtener todos los usuarios', async function() {
        const result = await this.userDao.getAll();
        console.log(result);
        assert.strictEqual(Array.isArray(result), true);
    });

    it('Debe obtener un usuario por ID', async function() {
        const user = await this.userDao.create({ first_name: 'John Smith', email: 'johnsmith@example.com', password: 'password123' });
        const result = await this.userDao.getOne(user._id);
        assert.strictEqual(result.email, user.email);
    });

    it('Debe actualizar un usuario', async function() {
        const user = await this.userDao.create({ first_name: 'Johnny Depp', email: 'johnny@example.com', password: 'password123' });
        const updatedData = { first_name: 'Johnny Depp Updated' };
        await this.userDao.update(user._id, updatedData);
        const result = await this.userDao.getOne(user._id);
        assert.strictEqual(result.first_name, updatedData.first_name);
    });

    it('Debe eliminar un usuario', async function() {
        const user = await this.userDao.create({ first_name: 'John Wick', email: 'johnwick@example.com', password: 'password123' });
        await this.userDao.deleteData(user._id);
        const result = await this.userDao.getOne(user._id);
        assert.strictEqual(result, null);
    });
});