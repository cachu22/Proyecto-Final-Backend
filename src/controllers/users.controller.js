import { userService } from "../service/index.js";
import UserDto from "../dtos/users.dto.js";
import { CustomError } from "../service/errors/CustomError.js";
import { generateUserError } from "../service/errors/info.js";
import { EError } from "../service/errors/enums.js";
import { createHash } from "../utils/bcrypt.js";
import { logger } from "../utils/logger.js";

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
        try {
            const { uid } = req.params;
            const result = await this.userService.deleteUser(uid);
            res.send({ status: 'success', payload: result });
        } catch (error) {
            logger.error("Error al eliminar usuario - Log de src/controllers/user.controller.js:", error);
            res.status(500).send({ status: 'error', message: 'Error al eliminar usuario' });
        }
    }


        //Botón de cambiar rol que funciona correctamente, comentado para la entrega
    // changeUserRole = async (req, res) => {
    //     try {
    //         const { uid } = req.params;
    //         const user = await this.userService.getUser(uid);
            
    //         if (!user) {
    //             const errorMessage = 'Usuario no encontrado';
    //             logger.error(`Error al actualizar el rol de usuario: ${errorMessage} - Log de /src/controllers/user.controller.js`);
    //             return res.status(404).json({ status: 'error', message: errorMessage });
    //         }
        
    //         // Cambia el rol del usuario
    //         user.role = user.role === 'user' ? 'premium' : 'user';
    //         await user.save();
        
    //         res.status(200).json({ status: 'success', message: 'Rol de usuario actualizado.', user });
    //     } catch (error) {
    //         logger.error(`Error al actualizar el rol de usuario: ${error.message} - Log de /src/controllers/user.controller.js`);
    //         res.status(500).json({ status: 'error', message: 'Error al actualizar el rol de usuario.', error: error.message });
    //     }
    // };

    changeUserRole = async (req, res) => {
        try {
            const { uid } = req.params;
            const user = await this.userService.getUser(uid);
            
            if (!user) {
                const errorMessage = 'Usuario no encontrado';
                logger.error(`Error al actualizar el rol de usuario: ${errorMessage} - Log de /src/controllers/user.controller.js`);
                return res.status(404).json({ status: 'error', message: errorMessage });
            }
    
            // Verifica si el rol actual es 'user' para cambiarlo a 'premium'
            if (user.role === 'user') {
                const requiredDocs = ['Identificación', 'Comprobante de domicilio', 'Comprobante de estado de cuenta'];
                const uploadedDocs = user.documents.map(doc => doc.name);
    
                const hasAllDocs = requiredDocs.every(doc => uploadedDocs.includes(doc));
    
                if (!hasAllDocs) {
                    const errorMessage = 'No se puede actualizar a premium. Documentación incompleta.';
                    logger.error(`Error al actualizar el rol de usuario: ${errorMessage} - Log de /src/controllers/user.controller.js`);
                    return res.status(400).json({ status: 'error', message: errorMessage });
                }
    
                // Cambia el rol del usuario a 'premium'
                user.role = 'premium';
            } else if (user.role === 'premium') {
                // Cambia el rol del usuario de vuelta a 'user'
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
            const user = await userModel.findById(userId);
    
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
            res.status(200).json({ message: 'Documentos subidos exitosamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al subir documentos', error: error.message });
        }
    };
}

export default UserController;