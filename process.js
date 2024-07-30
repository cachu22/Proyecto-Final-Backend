import { logger } from "./src/utils/logger.js";

const program = new Command()

program
    .option('-d', 'Variable para debug', false)
    .option('-p <port>', 'Puerto del server', 8000)
    .option('--mode <mode>', 'Modo de trabajo de mi server', 'Production')
    .option('-u <user>', 'Usuario utilizando el applicativo', 'No se ha declarado')
    .option('-l, --letters [Letters...]', 'specify letter')
program.parse()

logger.info('Options - /process.js: ', program.opts());
logger.info('Argumentos -/process.js: ', program.args);