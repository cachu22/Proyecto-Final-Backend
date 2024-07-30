import express from 'express';
import { messageModel } from './MONGO/models/message.models.js';
import { logger } from '../utils/logger.js';

const messageRouter = express.Router();

// Ruta para guardar un nuevo mensaje
messageRouter.post('/save-message', async (req, res) => {
    const { user, message } = req.body;
    
    // Validar los datos recibidos
    if (!user || !message) {
        logger.warn('Faltan datos en la solicitud - Log de /src/daos/messageDao.mongo.js:', { user, message });
        return res.status(400).send('Datos incompletos: usuario o mensaje faltante');
    }

    try {
        // Guardar el mensaje en la base de datos utilizando el MessageModel
        const newMessage = new messageModel({ user, message });
        const savedMessage = await newMessage.save();
        logger.info('Mensaje guardado en la base de datos - Log de /src/daos/messageDao.mongo.js:', savedMessage);
        res.status(200).send('Mensaje guardado en la base de datos');
    } catch (error) {
        logger.error('Error al guardar el mensaje en la base de datos - Log de /src/daos/messageDao.mongo.js:', error);
        res.status(500).send('Error al guardar el mensaje en la base de datos');
    }
});

export default messageRouter;