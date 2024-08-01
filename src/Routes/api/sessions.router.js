import { Router } from 'express';
import usersDaoMongo from '../../daos/MONGO/MONGODBNUBE/usersDao.mongo.js';
import CartDaoMongo from '../../daos/MONGO/MONGODBNUBE/cartsDao.mongo.js';
import passport from 'passport';
import { generateToken } from '../../utils/jwt.js';
import { passportCall } from '../../middlewares/passportCall.middleware.js';
import { authorization } from '../../middlewares/Authorization.middleware.js';
import { createHash, isValidPassword, generateRandomPassword } from '../../utils/bcrypt.js';
import jwt from 'jsonwebtoken';
import UserController from '../../controllers/users.controller.js';
import { isAuthenticated } from '../../middlewares/Auth.middleware.js';
import { CustomError } from '../../service/errors/CustomError.js';
import { generateUserError } from '../../service/errors/info.js';
import { EError } from '../../service/errors/enums.js';
import { logger } from '../../utils/logger.js';
import crypto from 'crypto';
import { sendEmail } from '../../utils/sendMail.js';
import bcrypt from 'bcrypt';
import { objectConfig } from '../../config/index.js'

const port = objectConfig;

export const sessionsRouter = Router();

const userService = new usersDaoMongo();
const cartService = new CartDaoMongo();
const userController = new UserController();

sessionsRouter.get('/github', passport.authenticate('github', { scope: 'user:email' }), async (req, res) => {
    logger.info('Redirigiendo a GitHub para autenticación - src/Routes/api/sessions.router.js');
});

sessionsRouter.post('/register', async (req, res, next) => {
    logger.info('Se recibió una solicitud de registro - src/Routes/api/sessions.router.js', req.body);

    const { first_name, last_name, password, email, age } = req.body;

    // Validación de campos obligatorios
    if (!password || !email) {
        logger.info('Error: Faltan credenciales en la solicitud de registro - src/Routes/api/sessions.router.js');
        return res.status(401).send({ status: 'error', message: 'Debe ingresar todas las credenciales' });
    }

    if (!first_name || !last_name || !email) {
        CustomError.createError({
            name: 'UserValidationError',
            cause: generateUserError({ first_name, last_name, email }),
            message: 'Error al crear el usuario',
            code: EError.INVALID_TYPES_ERROR
        });
    }

    try {
        // Verificar si ya existe un usuario con el mismo email
        logger.info('Buscando usuario en la base de datos - src/Routes/api/sessions.router.js...', { email });
        const userFound = await userService.get({ email });

        if (userFound) {
            logger.info('Error: El usuario ya existe - src/Routes/api/sessions.router.js');
            return res.status(401).send({ status: 'error', message: 'El usuario ya existe' });
        }

        // Preparar nuevo usuario
        const newUser = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password)
        };

        // Crear el usuario en la base de datos
        logger.info('Creando un nuevo usuario en la base de datos - src/Routes/api/sessions.router.js...', newUser);
        const result = await userService.create(newUser);

        // Generar token JWT para el usuario registrado
        const token = generateToken({ id: result._id });

        logger.info('Usuario registrado exitosamente - src/Routes/api/sessions.router.js', { userId: result._id });
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 * 24, httpOnly: true })
            .redirect('/login');
    } catch (error) {
        logger.error('Error en el registro de usuario - src/Routes/api/sessions.router.js', { error });
        next(error); // Pasar el error al middleware de manejo de errores
    }
});

sessionsRouter.post('/failregister', async (req, res) => {
    logger.info('Falló la estrategia de registro - src/Routes/api/sessions.router.js');
    res.send({ error: 'failed' });
});

// Función para generar el token JWT
function generateJWTToken(user) {
    return jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '1h' });
}

// Función de autenticación
async function authenticateUser(email, password) {
    try {
        const user = await userService.get({ email });
        if (!user) {
            return { success: false, message: 'Usuario no encontrado.' };
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return { success: false, message: 'Contraseña incorrecta.' };
        }

        // Generar token JWT o cualquier otra lógica de autenticación aquí
        return { success: true, user };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Error en la autenticación.' };
    }
}

// Ruta de inicio de sesión
sessionsRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        logger.info('Error: Faltan datos en la solicitud de login - src/Routes/api/sessions.router.js');
        return res.status(401).json({ status: 'error', error: 'Se deben completar todos los datos' });
    }

    logger.info('Recibiendo solicitud de login - src/Routes/api/sessions.router.js', { email });

    try {
        const result = await authenticateUser(email, password);

        if (result.success) {
            // Generar y enviar token JWT
            const token = generateToken({ id: result.user._id, email: result.user.email });

            // Almacenar los datos del usuario en la sesión, incluyendo el rol
            req.session.user = {
                first_name: result.user.first_name,
                last_name: result.user.last_name,
                email: result.user.email,
                role: result.user.role,
                id: result.user._id
            };

            // Establecer una cookie con datos del usuario
            res.cookie('user', JSON.stringify({
                email: req.session.user.email,
                first_name: req.session.user.first_name,
                last_name: req.session.user.last_name,
                role: req.session.user.role
            }), { maxAge: 1000000, httpOnly: true });

            logger.info('Usuario autenticado exitosamente - src/Routes/api/sessions.router.js', { user: req.session.user });

            // Enviar la respuesta con el token JWT y redirigir a la ruta principal
            res.json({ status: 'success', token, redirectTo: '/' });
        } else {
            res.status(401).json({ status: 'error', message: result.message });
        }
    } catch (error) {
        logger.error('Error en la autenticación del usuario - src/Routes/api/sessions.router.js', error);
        res.status(500).json({ status: 'error', message: 'Error en la autenticación del usuario', error: error.message });
    }
});

sessionsRouter.post('/faillogin', (req, res) => {
    logger.info('Falló la estrategia de login - src/Routes/api/sessions.router.js');
    res.send({ error: 'falló el login' });
});

// Callback de GitHub con JWT
sessionsRouter.get('/current', isAuthenticated, userController.getOneInfo);

sessionsRouter.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            logger.error('Error al destruir la sesión - src/Routes/api/sessions.router.js', { error: err });
            return res.send({ status: 'error', error: err });
        } else {
            logger.info('Sesión destruida exitosamente - src/Routes/api/sessions.router.js');
            return res.redirect('/login');
        }
    });
});

// Ruta para autenticación con GitHub
sessionsRouter.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// Callback de GitHub con JWT
sessionsRouter.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), async (req, res) => {
    // Generar un token JWT para el usuario autenticado
    const token = generateToken({ id: req.user._id });

    // Establecer una cookie con el token JWT
    res.cookie('token', token, { maxAge: 60 * 60 * 1000 * 24, httpOnly: true });

    // Establecer una cookie con los datos del usuario
    res.cookie('user', JSON.stringify({
        email: req.user.email,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        isAdmin: req.user.role === 'admin'
    }), { maxAge: 1000000, httpOnly: true });

    logger.info('Datos del usuario después de GitHub - src/Routes/api/sessions.router.js', { user: req.user });

    // Redirigir a la página principal
    res.redirect('/');
});

// Ruta de solicitud de restablecimiento
sessionsRouter.post('/send-reset-email', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userService.get({ email });

        if (!user) {
            logger.error(`Usuario no encontrado con el email: ${email}`);
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Generar token de restablecimiento de contraseña
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
        await userService.update(user._id, user);

        // Enviar correo electrónico de restablecimiento de contraseña
        const resetUrl = `http://localhost:${objectConfig.port}/reset/${resetToken}`;
        const mailOptions = {
            email: user.email,
            subject: 'Solicitud de restablecimiento de contraseña',
            html: `<p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para restablecer tu contraseña:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
        };

        logger.info(`Enviando correo a: ${user.email} con el enlace: ${resetUrl}`);

        await sendEmail(mailOptions);

        res.status(200).json({ message: 'Solicitud de restablecimiento recibida. Si su correo esta registrado se enviará un mail con un link para restablecer su contraseña.' });
    } catch (error) {
        logger.error('Error al enviar correo de restablecimiento de contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

sessionsRouter.post('/reset/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
  
      const user = await userService.get({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
      if (!user) {
        return res.status(400).json({ error: 'Token inválido o expirado.' });
      }
  
      user.password = await bcrypt.hash(password, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
  
      await user.save();
      res.status(200).json({ message: 'Contraseña restablecida con éxito.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al restablecer la contraseña.' });
    }
  });

export default sessionsRouter;