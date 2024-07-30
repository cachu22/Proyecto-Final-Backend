import { Command } from 'commander';
import { logger } from './logger.js';

const program = new Command();

program
    .option('--mode <mode>', 'Modo de ejecución', 'development')
    .parse(process.argv);

const options = program.opts();
logger.info('Modo de ejecución seleccionado - src/utils/commander.js:', options.mode);

export { program };