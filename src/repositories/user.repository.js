import { UserDto } from "../dtos/users.dto.js";
import { logger } from "../utils/logger.js";
import { UsersDao } from "../daos/factory.js";
import mongoose from "mongoose";
import { sendEmail } from "../utils/sendMail.js";

const usersDao = new UsersDao()

export default class UserRepository {
    constructor(userDao) {
        this.userDao = userDao;
    }

    getUsers = async () => {
        const users = await this.userDao.getAll();
        return users.map(user => new UserDto(user));
    }

    getUser = async (filter) => {
        if (filter._id && !mongoose.Types.ObjectId.isValid(filter._id)) {
            throw new Error('Invalid user ID');
        }
        const user = await this.userDao.getOne(filter);
        logger.info('Usuario en getUser - user.repository - src/repositories/user.repository.js', user); // Log info
        return user;
    }

    getUserInfo = async (filter) => {
        try {
            logger.info(`Fetching user info with filter: ${JSON.stringify(filter)}`);
            const user = await this.userDao.getOneInfo(filter);
            return user ? new UserDto(user) : null; // -  Se comenta porque solo necesito el mail
            // return user ? { email: user.email } : null;
        } catch (error) {
            logger.error('Error fetching user info:', error);
            throw error;
        }
    }        
    
    createUser = async (user) => {
        const newUser = new UserDto(user);
        const createdUser = await this.userDao.create(newUser);
        logger.info('Usuario creado - user.repository - src/repositories/user.repository.js', createdUser); // Log info
        return createdUser;
    }

    updateUser = async (uid, userToUpdate) => {
        if (userToUpdate.first_name || userToUpdate.last_name) {
            userToUpdate.fullname = `${userToUpdate.first_name || ''} ${userToUpdate.last_name || ''}`.trim();
        }
        const updatedUser = await this.userDao.update(uid, userToUpdate);
        logger.info('Usuario actualizado - user.repository - src/repositories/user.repository.js', updatedUser); // Log info
        return updatedUser ? new UserDto(updatedUser) : null;
    }

    deleteUser = async (uid) => {
        const deletedUser = await this.userDao.deleteData(uid);
        logger.info('Usuario eliminado - user.repository - src/repositories/user.repository.js', deletedUser); // Log info
        return deletedUser ? new UserDto(deletedUser) : null;
    }

    deleteInactiveUsers = async (cutoffDate) => {
        try {
            logger.info(`Fecha de umbral para inactividad: ${cutoffDate}`);
    
            // Buscar usuarios inactivos usando el DAO
            const inactiveUsers = await usersDao.findInactiveUsers(cutoffDate);
            logger.info(`Usuarios inactivos encontrados: ${JSON.stringify(inactiveUsers)}`);
    
            if (inactiveUsers.length === 0) {
                logger.info('No hay usuarios inactivos para eliminar.');
                return { status: 'success', message: 'No hay usuarios inactivos para eliminar.' };
            }
    
            // Enviar correos a los usuarios inactivos antes de eliminarlos
            for (const user of inactiveUsers) {
                await sendEmail({
                    email: user.email,
                    subject: 'Cuenta eliminada por inactividad',
                    html: `<p>Estimado/a ${user.first_name},</p>
                           <p>Su cuenta ha sido eliminada debido a inactividad en los últimos 2 días.</p>
                           <p>Saludos cordiales,</p>
                           <p>El equipo de soporte.</p>`
                });
            }
    
            // Extraer los IDs de los usuarios inactivos y filtrar los válidos
            const userIds = inactiveUsers.map(user => user._id);
            const validUserIds = userIds.filter(id => mongoose.Types.ObjectId.isValid(id));
            logger.info(`IDs válidos para eliminación: ${JSON.stringify(validUserIds)}`);
    
            if (validUserIds.length === 0) {
                logger.info('No hay IDs válidos para eliminar.');
                return { status: 'success', message: 'No hay IDs válidos para eliminar.' };
            }
    
            // Eliminar usuarios inactivos usando el DAO
            const result = await usersDao.deleteUsersByIds(validUserIds);
            logger.info(`Resultado de la eliminación: ${JSON.stringify(result)}`);
    
            return { status: 'success', message: `${validUserIds.length} usuarios eliminados.` };
        } catch (error) {
            logger.error('Error al eliminar usuarios inactivos:', error);
            throw new Error('Error al eliminar usuarios inactivos.');
        }
    };

    async sendPasswordResetEmail(email) {
        try {
          await this.userDao.sendPasswordResetEmail(email);
          return { message: 'Correo de recuperación enviado' };
        } catch (error) {
          logger.error('Error al enviar el correo de recuperación:', error.message);
          throw new Error('Hubo un problema al enviar el correo de recuperación. Inténtalo de nuevo más tarde.');
        }
      }
}