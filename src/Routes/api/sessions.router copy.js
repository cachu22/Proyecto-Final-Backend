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
import crypto from 'crypto'
import { sendEmail } from '../../utils/sendMail.js';
import bcrypt from 'bcrypt'

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

sessionsRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        logger.info('Error: Faltan datos en la solicitud de login - src/Routes/api/sessions.router.js');
        return res.status(401).json({ status: 'error', error: 'Se deben completar todos los datos' });
    }

    logger.info('Recibiendo solicitud de login - src/Routes/api/sessions.router.js', { email });

    const userFound = await userService.get({ email });

    if (!userFound) {
        logger.info('Error: Usuario no encontrado - src/Routes/api/sessions.router.js', { email });
        return res.status(401).send({ status: 'error', error: 'Usuario no encontrado' });
    }

    // Generar el token JWT
    const token = generateToken({ id: userFound._id, email: userFound.email });

    // Almacenar los datos del usuario en la sesión
    req.session.user = {
        first_name: userFound.first_name,
        last_name: userFound.last_name,
        email: userFound.email,
        isAdmin: userFound.role === 'admin',
        id: userFound._id
    };

    // Establecer una cookie con datos del usuario
    res.cookie('user', JSON.stringify({
        email: req.session.user.email,
        first_name: req.session.user.first_name,
        last_name: req.session.user.last_name,
        isAdmin: req.session.user.isAdmin
    }), { maxAge: 1000000, httpOnly: true });

    logger.info('Usuario autenticado exitosamente - src/Routes/api/sessions.router.js', { user: req.session.user });

    // Enviar la respuesta con el token JWT y redirigir a la ruta principal
    res.json({ status: 'success', token, redirectTo: '/' });
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

//Ruta de solicitud de restablecimiento
sessionsRouter.post('/send-reset-email', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userService.get({ email });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora

        await user.save();

        const resetUrl = `http://${req.headers.host}/reset/${resetToken}`;
        const subject = 'Restablecimiento de contraseña';
        const html = `
            <p>Recibiste esto porque tú (u otra persona) solicitó restablecer la contraseña de tu cuenta.</p>
            <p>Haz clic en el siguiente enlace, o copia y pega esta URL en tu navegador para completar el proceso:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>Si no solicitaste esto, ignora este correo y tu contraseña permanecerá sin cambios.</p>
        `;

        await sendEmail({ email: user.email, subject, html });

        return res.status(200).json({ message: 'Correo de recuperación enviado' });
    } catch (error) {
        logger.error('Error al procesar la solicitud de restablecimiento de contraseña:', error.message);
        return res.status(500).json({ message: 'Hubo un problema al enviar el correo de recuperación. Inténtalo de nuevo más tarde.' });
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