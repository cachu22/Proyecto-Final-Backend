import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import { logger } from './logger.js';

// Función para generar una contraseña aleatoria
export const generateRandomPassword = () => {
    const password = randomBytes(8).toString('hex');
    logger.info('Contraseña aleatoria generada - src/utils/bcrypt.js:', password);
    return password;
};

// Función para crear un hash de la contraseña
export const createHash = password => {
    const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    logger.info('Hash de la contraseña creado - src/utils/bcrypt.js:', hash);
    return hash;
};

// Función para validar la contraseña
export const isValidPassword = (user, password) => {
    const isValid = bcrypt.compareSync(password, user.password);
    logger.info('Validación de contraseña - src/utils/bcrypt.js:', isValid ? 'Éxito' : 'Fallo');
    return isValid;
};