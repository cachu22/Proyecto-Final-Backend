import cluster from 'node:cluster';
import { cpus } from 'node:os';
import { getServer } from './src/server.js';
import { logger } from './src/utils/logger.js';

const numeroDeProcesadores = cpus().length;
logger.info('Número de procesadores - /app.js:', numeroDeProcesadores);

if (cluster.isPrimary) {
    logger.info('Proceso primario, generando procesos hijos... - /app.js');
    for (let i = 0; i < numeroDeProcesadores; i++) {
        cluster.fork();
        logger.info(`Proceso hijo ${i + 1} generado  - /app.js`);
    }
    cluster.on('message', worker => {
        logger.info(`Worker ${worker.process.pid} recibió un mensaje  - /app.js`);
    });
} else {
    logger.info('Proceso forkeado, no soy el proceso primario, soy un worker  - /app.js');
    logger.info(`Soy un proceso hijo con el ID  - /app.js: ${process.pid}`);
    getServer();
}