import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger.js';

// Obtiene la ruta del archivo actual
const __filename = fileURLToPath(import.meta.url);
logger.info('Ruta del archivo actual - src/utils/utils.js:', __filename);

// Obtiene el directorio base "src"
const __dirname = dirname(dirname(__filename));
logger.info('Directorio base "src" - src/utils/utils.js:', __dirname);

// Función para generar un ID único
function generateUniqueId() {
    const id = uuidv4();
    logger.info('ID único generado - src/utils/utils.js:', id);
    return id;
}

export { __filename, __dirname, generateUniqueId };