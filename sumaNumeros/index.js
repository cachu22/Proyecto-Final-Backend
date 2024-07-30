import { logger } from "../src/utils/logger.js"


// const suma = (numero1,numero2) => {
//     if(!numero1 || !numero2 ) return 0
//     if(typeof numero1 !== "number" || typeof numero2 !== 'number') return null
//     const total = numero1 + numero2
//     return total
// }

// const suma = (...numeros) => {
//     //     if(!numero1 || !numero2 ) return 0
//     if (numeros.length === 0) return 0

//     let validInput = true
//     for (let i = 0; i < numeros.length && validInput; i++){
//         if (typeof numeros [i] !== 'number') {
//             validInput = false
//         }
//     }
//     if(!validInput) return null

//     let result = 0
//     for (let i = 0; i < numeros.length; i++) {
//         result += numeros[i]
//     }
//     return result
// }

// [2, 3, 3]

const suma = (...numeros) => {
    logger.info('Ejecutando función suma con parámetros - /sumaNumeros/index.js:', numeros);
    if (numeros.length === 0) {
        logger.info('No se pasaron parámetros, devolviendo 0 - /sumaNumeros/index.js');
        return 0;
    }
    if (!numeros.every(numero => typeof numero === 'number')) {
        logger.info('Se encontraron parámetros no numéricos, devolviendo null - /sumaNumeros/index.js');
        return null;
    }
    const resultado = numeros.reduce((sumaTotal, numero) => sumaTotal + numero, 0);
    logger.info('Resultado de la suma - /sumaNumeros/index.js:', resultado);
    return resultado;
};

let testsPasados = 0;
let cantidadTest = 4;

logger.info('Test 1: La función debe devolver null si algún parámetro es no numérico - /sumaNumeros/index.js');
let resultTest1 = suma("2", 2);
if (resultTest1 === null) {
    logger.info('Test 1 pasó - /sumaNumeros/index.js');
    testsPasados++;
} else {
    logger.info(`Test 1 no pasó, se recibió ${typeof resultTest1}, pero se esperaba null - /sumaNumeros/index.js`);
}
logger.info('---------------------------------- - /sumaNumeros/index.js');

logger.info('Test 2: La función debe devolver 0 si no se pasó ningún parámetro - /sumaNumeros/index.js');
let resultTest2 = suma();
if (resultTest2 === 0) {
    logger.info('Test 2 pasó - /sumaNumeros/index.js');
    testsPasados++;
} else {
    logger.info(`Test 2 no pasó, se recibió ${resultTest2} pero se esperaba 0 - /sumaNumeros/index.js`);
}
logger.info('---------------------------------- - /sumaNumeros/index.js');

logger.info('Test 3: La función debe resolver la suma correctamente - /sumaNumeros/index.js');
let resultTest3 = suma(3, 2);
if (resultTest3 === 5) {
    logger.info('Test 3 pasó - /sumaNumeros/index.js');
    testsPasados++;
} else {
    logger.info(`Test 3 no pasó, se recibió ${resultTest3}, pero se esperaba 5 - /sumaNumeros/index.js`);
}
logger.info('---------------------------------- - /sumaNumeros/index.js');

logger.info('Test 4: La función debe resolver cualquier cantidad de números - /sumaNumeros/index.js');
let resultTest4 = suma(1, 2, 3, 4, 5);
if (resultTest4 === 15) {
    logger.info('Test 4 pasó - /sumaNumeros/index.js');
    testsPasados++;
} else {
    logger.info(`Test 4 no pasó, se recibió ${resultTest4}, pero se esperaba 15 - /sumaNumeros/index.js`);
}
logger.info('---------------------------------- - /sumaNumeros/index.js');

if (testsPasados === cantidadTest) {
    logger.info('Todos los tests pasaron correctamente - /sumaNumeros/index.js');
} else {
    logger.info(`Se pasaron ${testsPasados} tests, de un total de ${cantidadTest} - /sumaNumeros/index.js`);
}