import { userService } from "../service/index.js";
import { UserDto, UserInactiveDto } from "../dtos/users.dto.js";
import { CustomError } from "../service/errors/CustomError.js";
import { generateUserError } from "../service/errors/info.js";
import { EError } from "../service/errors/enums.js";
import { createHash } from "../utils/bcrypt.js";
import { logger } from "../utils/logger.js";
import { checkFilesUploaded } from "../middlewares/Auth.middleware.js";
import { sendEmail } from '../utils/sendMail.js';
import mongoose from "mongoose";


class UserController {
    constructor() {
        this.userService = userService;
    }

    getAll = async (req, res) => {
        try {
            const users = await this.userService.getUsers();
            res.send({ status: 'success', payload: users });
        } catch (error) {
            logger.error("Error al obtener usuarios - Log de src/controllers/user.controller.js:", error);
            res.status(500).send({ status: 'error', message: 'Error al obtener usuarios' });
        }
    }

    getOne = async (req, res) => {
        try {
            const userId = req.params.uid;
            if (!userId) {
                return res.status(400).json({ status: 'error', message: 'ID Erroneo' });
            }
            const user = await this.userService.getUser(userId);
            if (!user) {
                return res.status(404).json({ status: 'error', message: 'User not found' });
            }
            logger.info('Datos del usuario - Log de src/controllers/user.controller.js:', user);
            res.json({ status: 'success', payload: user });
        } catch (error) {
            logger.error("Error al obtener usuario - Log de src/controllers/user.controller.js:", error);
            res.status(500).json({ status: 'error', message: 'Server error' });
        }
    }

    getOneInfo = async (req, res) => {
        try {
            const userId = req.user.id;
            if (!userId) {
                return res.status(400).json({ status: 'error', message: 'ID Erroneo' });
            }
            const user = await this.userService.getUserInfo(userId);
            if (!user) {
                return res.status(404).json({ status: 'error', message: 'User not found' });
            }
            res.json({ status: 'success', payload: user });
        } catch (error) {
            logger.error("Error al obtener información del usuario - Log de src/controllers/user.controller.js:", error);
            res.status(500).json({ status: 'error', message: 'Server error' });
        }
    };

    create = async (req, res, next) => {
        console.log('Datos recibidos en la solicitud supertest:', req.body);
        try {
            const { first_name, last_name, email, password, role, age, fullname } = req.body;
            if (!first_name || !last_name || !email) {
                CustomError.createError({
                    name: 'UserValidationError',
                    cause: generateUserError({ first_name, last_name, email }),
                    message: 'Error al crear el usuario',
                    code: EError.INVALID_TYPES_ERROR
                });
            }

            const newUser = {
                first_name,
                last_name,
                email,
                fullname,
                role,
                password: createHash(password), // Hashear la contraseña
                age
            };

            const result = await this.userService.createUser(newUser);
            res.status(200).send({ status: 'success', payload: result });
        } catch (error) {
            logger.error("Error al crear usuario - Log de src/controllers/user.controller.js:", error);
            next(error); // Asegúrate de que `next` esté definido como un argumento
        }
    }

    update = async (req, res) => {
        try {
            const { uid } = req.params;
            const { first_name, last_name, email, age, password, role } = req.body;

            if (!first_name && !last_name && !email && !age && !password && !role) {
                return res.status(400).send({ status: 'error', message: 'No hay campos para actualizar' });
            }

            const updatedUser = {};
            if (first_name) updatedUser.first_name = first_name;
            if (last_name) updatedUser.last_name = last_name;
            if (email) updatedUser.email = email;
            if (age) updatedUser.age = age;
            if (password) updatedUser.password = createHash(password);
            if (role) updatedUser.role = role;

            const result = await this.userService.updateUser(uid, updatedUser);
            res.send({ status: 'success', payload: result });
        } catch (error) {
            logger.error("Error al actualizar usuario - Log de src/controllers/user.controller.js:", error);
            res.status(500).send({ status: 'error', message: 'Error al actualizar usuario' });
        }
    }

    deleteData = async (req, res) => {
        const { uid } = req.params;
        console.log(`ID recibido para eliminar: ${uid}`); // Agregado para depuración
        
        try {
            // Verificar que el ID es válido
            if (!uid) {
                console.log('ID no proporcionado en la solicitud.');
                return res.status(400).json({ message: 'ID no proporcionado' });
            }
        
            console.log(`Intentando eliminar el usuario con ID: ${uid}`); // Agregado para depuración
            const result = await userService.deleteUser(uid);
    
            console.log(`Resultado de la eliminación: ${JSON.stringify(result)}`); // Agregado para depuración
    
            if (!result) {
                console.log('Usuario no encontrado durante la eliminación.');
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
        
            console.log('Usuario eliminado correctamente.');
            return res.status(200).json({ message: 'Usuario eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar usuario:', error.message); // Usar console.error para errores
            logger.error('Error al eliminar usuario - Log de users.controller.js:', error.message);
            return res.status(500).json({ message: 'Error interno al eliminar usuario' });
        }
    };

    //Botón para cambiar rol de usuario sin necesidad de documentacion
    // changeUserRole = async (req, res) => {
    //     try {
    //         const { uid } = req.params;
    //         const user = await this.userService.getUser(uid);
    
    //         if (!user) {
    //             const errorMessage = 'Usuario no encontrado';
    //             logger.error(`Error al actualizar el rol de usuario1: ${errorMessage} - Log de /src/controllers/user.controller.js1`);
    //             return res.status(404).json({ status: 'error', message: errorMessage });
    //         }
    
    //         if (user.role === 'user') {
    //             // Cambia el rol del usuario a 'premium'
    //             user.role = 'premium';
    //         } else if (user.role === 'premium') {
    //             // Cambia el rol del usuario de vuelta a 'user'
    //             user.role = 'user';
    //         }
    
    //         await user.save();
    
    //         res.status(200).json({ status: 'success', message: 'Rol de usuario actualizado.', user });
    //     } catch (error) {
    //         logger.error(`Error al actualizar el rol de usuario2: ${error.message} - Log de /src/controllers/user.controller.js`);
    //         res.status(500).json({ status: 'error', message: 'Error al actualizar el rol de usuario3.', error: error.message });
    //     }
    // };

    //Botón para cambiar rol con necesidad de documentación
    changeUserRole = async (req, res) => {
        try {
            console.log(req.files);

            const { uid } = req.params;
            const user = await userService.getUser(uid);
    
            if (!user) {
                const errorMessage = 'Usuario no encontrado';
                logger.error(`Error al actualizar el rol de usuario: ${errorMessage} - Log de /src/controllers/user.controller.js`);
                return res.status(404).json({ status: 'error', message: errorMessage });
            }
    
            if (user.role === 'user') {
                const requiredDocs = ['identificacion.pdf', 'comprobante_domicilio.pdf', 'comprobante_estado_cuenta.pdf'];
    
                // Verificar si los documentos fueron subidos
                if (!req.files || !req.files['document'] || req.files['document'].length < 3) {
                    const errorMessage = 'No se han subido documentos.';
                    logger.error(`Error al actualizar el rol de usuario: ${errorMessage} - Log de /src/controllers/user.controller.js`);
                    return res.status(400).json({ status: 'error', message: errorMessage });
                }
    
                const uploadedDocs = req.files['document'].map(doc => doc.originalname);
    
                // Verificar que todos los documentos requeridos estén presentes
                const hasAllDocs = requiredDocs.every(doc => uploadedDocs.includes(doc));
    
                if (!hasAllDocs) {
                    const errorMessage = 'No se puede actualizar a premium. Documentación incompleta.';
                    logger.error(`Error al actualizar el rol de usuario: ${errorMessage} - Log de /src/controllers/user.controller.js`);
                    return res.status(400).json({ status: 'error', message: errorMessage });
                }
    
                req.files['document'].forEach(doc => {
                    user.documents.push({
                        name: doc.originalname,
                        reference: doc.path
                    });
                });
    
                user.role = 'premium';
            } else if (user.role === 'premium') {
                user.role = 'user';
            }
    
            await user.save();
    
            res.status(200).json({ status: 'success', message: 'Rol de usuario actualizado.', user });
        } catch (error) {
            logger.error(`Error al actualizar el rol de usuario: ${error.message} - Log de /src/controllers/user.controller.js`);
            res.status(500).json({ status: 'error', message: 'Error al actualizar el rol de usuario.', error: error.message });
        }
    };
  
    documents = async (req, res) => {
        try {
            const userId = req.params.uid;
            const user = await userService.getUser(userId);
    
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
    
            const documents = req.files['document'] || [];
            documents.forEach(doc => {
                user.documents.push({
                    name: doc.originalname,
                    reference: doc.path
                });
            });
    
            await user.save();
            return res.status(200).json({ message: 'Documentos subidos exitosamente' });
        } catch (error) {
            return res.status(500).json({ message: 'Error al subir documentos', error: error.message });
        }
    };
    
    deleteInactiveUsers = async (req, res) => {
        try {
            // Registrar la fecha de umbral para la búsqueda de usuarios inactivos (2 días atrás)
            const threshold = new Date();
            threshold.setDate(threshold.getDate() - 2);
            logger.info(`Fecha de umbral para inactividad: ${threshold}`);
    
            // Llamar al servicio para eliminar usuarios inactivos y enviar correos
            const result = await userService.deleteInactiveUsers(threshold);
            res.json(result);
        } catch (error) {
            logger.error('Error al eliminar usuarios inactivos:', error);
            res.status(500).json({ status: 'error', message: 'Error al eliminar usuarios inactivos.' });
        }
    };
    
}

export default UserController;