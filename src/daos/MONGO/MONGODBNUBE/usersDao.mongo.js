import mongoose from "mongoose";
import { userModel } from "../models/users.models.js";
import { logger } from "../../../utils/logger.js";

class UserDaoMongo {
  async get(query) {
    if (typeof query === 'string') {
      if (!mongoose.Types.ObjectId.isValid(query)) {
        logger.error('ID de usuario inválido - Log de /src/daos/MONGO/MONGODBNUBE/usersDao.mongo.js:', query);
        throw new Error('Invalid user ID');
      }
      return userModel.findOne({ _id: query });
    }
    return userModel.findOne(query);
  }

  async getOne(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.error('ID de usuario inválido - Log de /src/daos/MONGO/MONGODBNUBE/usersDao.mongo.js:', id);
      throw new Error('Invalid user ID');
    }
    return userModel.findOne({ _id: id });
  }

  async getOneInfo(filter) {
    try {
        const user = await userModel.findOne(filter);
        if (!user) {
            logger.warning('Usuario no encontrado con el filtro:', filter); // Reemplaza warn por warning
            throw new Error('Usuario no encontrado');
        }
        return user;
    } catch (error) {
        logger.error('Error al buscar usuario:', error.message);
        throw error;
    }
}

  async getAll() {
    try {
      const users = await userModel.find();
      logger.info('Usuarios obtenidos con éxito - Log de /src/daos/MONGO/MONGODBNUBE/usersDao.mongo.js:', users);
      return users;
    } catch (error) {
      logger.error('Error al obtener todos los usuarios - Log de /src/daos/MONGO/MONGODBNUBE/usersDao.mongo.js:', error.message);
      throw error;
    }
  }

  async create(user) {
    try {
      // Log para verificar el objeto antes de guardarlo en la base de datos
      logger.info('Objeto que se guarda en la base de datos - Log de /src/daos/MONGO/MONGODBNUBE/usersDao.mongo.js:', user);
      const newUser = await userModel.create(user);
      logger.info('Usuario creado con éxito - Log de /src/daos/MONGO/MONGODBNUBE/usersDao.mongo.js:', newUser);
      return newUser;
    } catch (error) {
      logger.error('Error al crear el usuario en la base de datos - Log de /src/daos/MONGO/MONGODBNUBE/usersDao.mongo.js:', error.message);
      throw error;
    }
  }

  async update(id, userData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.error('ID de usuario inválido - Log de /src/daos/MONGO/MONGODBNUBE/usersDao.mongo.js:', id);
      throw new Error('Invalid user ID');
    }
    try {
      const result = await userModel.updateOne({ _id: id }, { $set: userData });
      logger.info('Usuario actualizado con éxito - Log de /src/daos/MONGO/MONGODBNUBE/usersDao.mongo.js:', result);
      return result;
    } catch (error) {
      logger.error('Error al actualizar el usuario - Log de /src/daos/MONGO/MONGODBNUBE/usersDao.mongo.js:', error.message);
      throw error;
    }
  }

  async deleteData(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.error('ID de usuario inválido - Log de /src/daos/MONGO/MONGODBNUBE/usersDao.mongo.js:', id);
      throw new Error('Invalid user ID');
    }
    try {
      const result = await userModel.deleteOne({ _id: id });
      logger.info('Usuario eliminado con éxito - Log de /src/daos/MONGO/MONGODBNUBE/usersDao.mongo.js:', result);
      return result;
    } catch (error) {
      logger.error('Error al eliminar el usuario - Log de /src/daos/MONGO/MONGODBNUBE/usersDao.mongo.js:', error.message);
      throw error;
    }
  }

  async sendPasswordResetEmail(email) {
    try {
      const user = await userModel.findOne({ email });
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hora

      await user.save();

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      const mailOptions = {
        to: user.email,
        from: process.env.GMAIL_USER,
        subject: 'Restablecimiento de contraseña',
        text: `Recibiste esto porque tú (u otra persona) solicitó restablecer la contraseña de tu cuenta.\n\n
               Haz clic en el siguiente enlace, o copia y pega esta URL en tu navegador para completar el proceso:\n\n
               http://${process.env.HOST}/reset/${user.resetPasswordToken}\n\n
               Si no solicitaste esto, ignora este correo y tu contraseña permanecerá sin cambios.\n`,
      };

      await transporter.sendMail(mailOptions);
      logger.info('Correo de restablecimiento de contraseña enviado correctamente');
    } catch (error) {
      logger.error('Error al enviar el correo de restablecimiento de contraseña:', error.message);
      throw error;
    }
  }
}

export default UserDaoMongo;