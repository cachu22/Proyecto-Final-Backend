import jwt from 'jsonwebtoken';
import { logger } from './logger.js';

export const PRIVATE_KEY = 's3cr3etc@d3r';

export const generateToken = user => {
    logger.info('Log de jwt.js - Generación de token iniciada con usuario - src/utils/jwt.js:', user);
    const token = jwt.sign(user, PRIVATE_KEY, { expiresIn: '24h' });
    logger.info('Log de jwt.js - Token generado - src/utils/jwt.js:', token);
    console.log('PRIVATE_KEY en jwt.js:', PRIVATE_KEY);
    return token;
};

// import jwt from 'jsonwebtoken'

// export const PRIVATE_KEY = 's3cr3etc@d3r'

// export const generateToken = user => jwt.sign(user, process.env.JWT_PRIVATE_KEY, {expiresIn: '24h'})