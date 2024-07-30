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
            const userId = req.params.uid;
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
        try {
            const { first_name, last_name, email, password, age, fullname } = req.body;
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
}

export default UserController;