import passport from "passport";
import { logger } from "../utils/logger.js";

export const passportCall = strategy => {
    return (req, res, next) => {
        passport.authenticate(strategy, (err, user, info) => {
            if (err) {
                logger.error(`Error en la autenticación con ${strategy} - Log de /src/middlewares/passportCall.middleware.js:`, err);
                return next(err);
            }
            if (!user) {
                logger.warn(`Autenticación fallida con ${strategy}: ${info.message ? info.message : info.toString()} - Log de /src/middlewares/passportCall.middleware.js`);
                return res.status(401).send({ status: 'error', error: info.message ? info.message : info.toString() });
            }
            logger.info(`Usuario autenticado con ${strategy}: ${user.email || user.id} - Log de /src/middlewares/passportCall.middleware.js`);
            req.user = user;
            next();
        })(req, res, next);
    };
};