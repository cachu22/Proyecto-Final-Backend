import passport from 'passport';
import GithubStrategy from 'passport-github2';
import { Strategy as LocalStrategy } from 'passport-local';
import usersDaoMongo from '../daos/MONGO/MONGODBNUBE/usersDao.mongo.js';
import { createHash, isValidPassword, generateRandomPassword } from '../utils/bcrypt.js';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { PRIVATE_KEY } from '../utils/jwt.js';
import { userService } from '../service/index.js';
import { logger } from '../utils/logger.js';

const cookieExtractor = req => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['token'];
    }
    return token;
};

export const initializePassport = () => {
    passport.use('jwt', new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: PRIVATE_KEY
    }, async (jwt_payload, done) => {
        try {
            logger.info('JWT payload recibido - Log de /src/config/passport.config.js:', jwt_payload);
            const user = await userService.getUser({ _id: jwt_payload.id });
            if (user) {
                logger.info('Usuario encontrado - Log de /src/config/passport.config.js:', user);
                return done(null, user);
            } else {
                logger.warn('Usuario no encontrado con el ID - Log de /src/config/passport.config.js:', jwt_payload.id);
                return done(null, false);
            }
        } catch (error) {
            logger.error('Error en la autenticación JWT - Log de /src/config/passport.config.js:', error);
            return done(error, false);
        }
    }));

    // Estrategia de GitHub
    passport.use('github', new GithubStrategy({
        clientID: 'Iv23litYUUdGsaaCbXkR',
        clientSecret: '0c9b66b2985d39262164a27194fc882e5f241cba',
        callbackURL: 'https://proyecto-final-backend-z3fv.onrender.com/api/sessions/githubcallback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            logger.info('Perfil de GitHub recibido - Log de /src/config/passport.config.js:', profile);
            let user = await userService.getUser({ email: profile._json.email });
            if (!user) {
                // Generar una contraseña aleatoria y su hash
                const randomPassword = generateRandomPassword();
                const hashedPassword = createHash(randomPassword);

                let newUser = {
                    first_name: profile.displayName || profile.username || 'N/A',
                    last_name: profile.displayName || profile.username || 'N/A',
                    email: profile._json.email || 'N/A',
                    password: hashedPassword // Almacenar la contraseña hash en la base de datos
                };
                let result = await userService.createUser(newUser);
                logger.info('Nuevo usuario creado con GitHub - Log de /src/config/passport.config.js:', result);
                done(null, result);
            } else {
                logger.info('Usuario existente encontrado con GitHub - Log de /src/config/passport.config.js:', user);
                done(null, user);
            }
        } catch (err) {
            logger.error('Error en la estrategia de GitHub - Log de /src/config/passport.config.js:', err);
            return done(err);
        }
    }));

    // Estrategia de registro local
    passport.use('register', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, async (req, email, password, done) => {
        try {
            logger.info('Registro local solicitado con email - Log de /src/config/passport.config.js:', email);
            let user = await userService.getUser({ email });
            if (user) {
                logger.warn('Email ya registrado - Log de /src/config/passport.config.js:', email);
                return done(null, false, { message: 'Email ya registrado' });
            }

            const hashedPassword = createHash(password);
            const newUser = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email,
                password: hashedPassword
            };

            let result = await userService.createUser(newUser);
            logger.info('Nuevo usuario registrado localmente - Log de /src/config/passport.config.js:', result);
            return done(null, result);
        } catch (err) {
            logger.error('Error en el registro local - Log de /src/config/passport.config.js:', err);
            return done(err);
        }
    }));

    // Estrategia de login local
    passport.use('login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            logger.info('Inicio de sesión local solicitado con email - Log de /src/config/passport.config.js:', email);
            let user = await userService.getUser({ email });
            if (!user) {
                logger.warn('Usuario no encontrado con email - Log de /src/config/passport.config.js:', email);
                return done(null, false, { message: 'Usuario no encontrado' });
            }

            const isValid = isValidPassword(user, password);
            if (!isValid) {
                logger.warn('Contraseña incorrecta para el usuario con email - Log de /src/config/passport.config.js:', email);
                return done(null, false, { message: 'Contraseña incorrecta' });
            }

            logger.info('Usuario autenticado exitosamente - Log de /src/config/passport.config.js:', user);
            return done(null, user);
        } catch (err) {
            logger.error('Error en el inicio de sesión local - Log de /src/config/passport.config.js:', err);
            return done(err);
        }
    }));

    passport.serializeUser((user, done) => {
        logger.info('Serializando usuario - Log de /src/config/passport.config.js:', user._id);
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            logger.info('Deserializando usuario con ID - Log de /src/config/passport.config.js:', id);
            let user = await userService.getUser({ _id: id });
            done(null, user);
        } catch (error) {
            logger.error('Error al deserializar el usuario con ID - Log de /src/config/passport.config.js:', id, error);
            done(error);
        }
    });
};