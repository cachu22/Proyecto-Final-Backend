import UserDto from "../dtos/users.dto";
import { logger } from "../logger.js";

export default class UserRepository {
    constructor(userDao) {
        this.userDao = userDao;
    }

    getUsers = async () => {
        logger.info('Obteniendo todos los usuarios - src/utils/repositories/user.repository.js...');
        const users = await this.userDao.getAll();
        logger.info('Usuarios obtenidos - src/utils/repositories/user.repository.js:', users);
        return users;
    };

    getUser = async filter => {
        logger.info('Buscando usuario con filtro - src/utils/repositories/user.repository.js:', filter);
        const user = await this.userDao.getBy(filter);
        logger.info('Usuario encontrado - src/utils/repositories/user.repository.js:', user);
        return user;
    };

    createUser = async user => {
        const newUser = new UserDto(user);
        logger.info('Creando nuevo usuario - src/utils/repositories/user.repository.js:', newUser);
        const createdUser = await this.userDao.create(newUser);
        logger.info('Usuario creado - src/utils/repositories/user.repository.js:', createdUser);
        return createdUser;
    };

    updateUser = async (uid, userToUpdate) => {
        logger.info('Actualizando usuario con ID - src/utils/repositories/user.repository.js:', uid);
        logger.info('Datos a actualizar - src/utils/repositories/user.repository.js:', userToUpdate);
        const updatedUser = await this.userDao.update(uid, userToUpdate);
        logger.info('Usuario actualizado - src/utils/repositories/user.repository.js:', updatedUser);
        return updatedUser;
    };

    deleteUser = async uid => {
        logger.info('Eliminando usuario con ID - src/utils/repositories/user.repository.js:', uid);
        const result = await this.userDao.delete(uid);
        logger.info('Resultado de la eliminación del usuario - src/utils/repositories/user.repository.js:', result);
        return result;
    };
}