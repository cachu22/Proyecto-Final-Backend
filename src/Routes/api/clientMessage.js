import express from 'express';
import { logger } from '../../utils/logger.js';
// Importar sendEmail y sendSms cuando estén disponibles
// import { sendEmail } from '../../utils/sendMail.js';
// import { sendSms } from '../../utils/sendSms.js';

const clientMensajeria = express.Router();

clientMensajeria.get('/sms', async (req, res) => {
    try {
        const user = {
            first_name: 'Adrian',
            last_name: 'Fernández',
            email: 'ladrianfer.87@gmail.com'
        };
        // Uncomment sendSms function when available
        // sendSms()
        res.send('sms enviado');
        logger.info('SMS enviado a - src/Routes/api/clientMessage.js' + user.email);
    } catch (error) {
        logger.error('Error enviando SMS - src/Routes/api/clientMessage.js:', error);
    }
});

clientMensajeria.get('/mail', async (req, res) => {
    try {
        const user = {
            first_name: 'Adrian',
            last_name: 'Fernández',
            email: 'ladrianfer.87@gmail.com'
        };
        // Uncomment sendEmail function when available
        // sendEmail({
        //     email: user.email,
        //     subject: 'Email de prueba',
        //     html: `<h1>Bienvenido ${user.first_name} ${user.last_name}</h1>`
        // });
        res.send('Email enviado a su casilla');
        logger.info('Email enviado a - src/Routes/api/clientMessage.js ' + user.email); // Añadir logging informativo
    } catch (error) {
        logger.error('Error enviando email - src/Routes/api/clientMessage.js:', error); // Cambiar a logger.error para errores
    }
});

export default clientMensajeria;