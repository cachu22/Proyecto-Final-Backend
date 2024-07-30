import twilio from "twilio";
import { objectConfig } from "../config/index.js";
import { logger } from "./logger.js";

const { twilio_sid, twilio_token, twilio_phone } = objectConfig;

// Configuración del cliente de Twilio
const client = twilio(twilio_sid, twilio_token);
logger.info('Cliente de Twilio configurado con SID - src/utils/sendSms.js:', twilio_sid);
logger.info('Número de teléfono de Twilio - src/utils/sendSms.js:', twilio_phone);

export const sendSms = async () => {
    try {
        const message = await client.messages.create({
            body: 'Pagate la birra para IT',
            from: twilio_phone,
            to: '+5491124629745'
        });
        logger.info('SMS enviado exitosamente - src/utils/sendSms.js:', message.sid);
        return message;
    } catch (error) {
        logger.error('Error al enviar SMS - src/utils/sendSms.js:', error);
        throw error;
    }
}