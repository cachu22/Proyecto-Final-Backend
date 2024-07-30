import express from 'express';
import { logger } from '../../utils/logger.js';

const welcomeRouter = express.Router();

welcomeRouter.get('/welcome', (req, res) => {
    if (!req.session.user) {
        logger.info('Usuario no autenticado, redirigiendo a /login - src/Public/js/welcomeRouter.js'); // Log info
        return res.redirect('/login');
    }

    logger.info('Usuario autenticado, mostrando página de bienvenida - src/Public/js/welcomeRouter.js', req.session.user); // Log info

    res.render('home', {
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName
    });
});

export default welcomeRouter;