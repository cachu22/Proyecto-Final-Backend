import { logger } from "../../../utils/logger.js";
import { userModel } from "../../models/users.models.js";

class UserDaoFS {
  constructor() {
    this.userModel = userModel;
  }

  // Método para obtener todos los usuarios
  async getUsers() {
    try {
      const users = await this.userModel.find();
      return users;
    } catch (error) {
      logger.error('Error al obtener todos los usuarios - Log de /src/daos/MONGO/MONGODBLOCAL/userDao.js:', error.message);
      throw new Error('Error al obtener todos los usuarios: ' + error.message);
    }
  }

  // Método para obtener un usuario por su ID
  async getUserById(id) {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      return user;
    } catch (error) {
      logger.error('Error al obtener el usuario por ID - Log de /src/daos/MONGO/MONGODBLOCAL/userDao.js:', error.message);
      throw new Error('Error al obtener el usuario por ID: ' + error.message);
    }
  }

  // Método para obtener un usuario por su correo electrónico
  async getUserByEmail(email) {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      return user;
    } catch (error) {
      logger.error('Error al obtener el usuario por correo electrónico - Log de /src/daos/MONGO/MONGODBLOCAL/userDao.js:', error.message);
      throw new Error('Error al obtener el usuario por correo electrónico: ' + error.message);
    }
  }

  // Método para crear un nuevo usuario
  async createUser(userData) {
    try {
      const newUser = new this.userModel(userData);
      const savedUser = await newUser.save();
      return savedUser;
    } catch (error) {
      logger.error('Error al crear el usuario - Log de /src/daos/MONGO/MONGODBLOCAL/userDao.js:', error.message);
      throw new Error('Error al crear el usuario: ' + error.message);
    }
  }

  // Método para actualizar un usuario por su ID
  async updateUser(id, userData) {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(id, userData, { new: true });
      if (!updatedUser) {
        throw new Error('Usuario no encontrado');
      }
      return updatedUser;
    } catch (error) {
      logger.error('Error al actualizar el usuario - Log de /src/daos/MONGO/MONGODBLOCAL/userDao.js:', error.message);
      throw new Error('Error al actualizar el usuario: ' + error.message);
    }
  }

  // Método para eliminar un usuario por su ID
  async deleteUser(id) {
    try {
      const deletedUser = await this.userModel.findByIdAndDelete(id);
      if (!deletedUser) {
        throw new Error('Usuario no encontrado');
      }
      return deletedUser;
    } catch (error) {
      logger.error('Error al eliminar el usuario - Log de /src/daos/MONGO/MONGODBLOCAL/userDao.js:', error.message);
      throw new Error('Error al eliminar el usuario: ' + error.message);
    }
  }
}

export default UserDaoFS;