import { Router } from "express";
import { generateUser } from "../../utils/generateUsersMock.js";
import compression from 'express-compression';
import { faker } from "@faker-js/faker";
import { logger } from "../../utils/logger.js";

const routerCookie = Router();

routerCookie.get('/test/user', (req, res) => {
    let first_name = faker.person.firstName();
    let last_name = faker.person.lastName();
    let email = faker.internet.email();
    let password = faker.internet.password();

    logger.info('Generación de usuario de prueba - src/Routes/Pruebas/pruebas.router.js', { first_name, last_name, email });

    res.send({
        first_name,
        last_name,
        email,
        password
    });
});
 
// Operación simple
routerCookie.get('/simple', (req, res) => {
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
        sum += i;
    }
    logger.info('Operación simple completada - src/Routes/Pruebas/pruebas.router.js', { result: sum });
    res.send(`La suma es ${sum}`);
});

// Operación compleja
routerCookie.get('/compleja', (req, res) => {
    let sum = 0;
    for (let i = 0; i < 5e8; i++) {
        sum += i;
    }
    logger.info('Operación compleja completada - src/Routes/Pruebas/pruebas.router.js', { result: sum });
    res.send(`La suma es ${sum}`);
});

routerCookie.get('/loggertest', (req, res) => {
    logger.fatal('Probando el logger - src/Routes/Pruebas/pruebas.router.js');
    res.send('Logger funcionando');
});

routerCookie.use(compression({
    brotli: {
        enabled: true,
        zlib: {}
    }
}));

routerCookie.get('/stringmuylargo', (req, res) => {
    let string = `hola coders soy un string horriblemente largo`;
    for (let i = 0; i < 5e4; i++) {
        string += `Hola coders soy un string muy largo`;
    }
    logger.info('Envío de string largo - src/Routes/Pruebas/pruebas.router.js', { length: string.length });
    res.status(200).send(string);
});

routerCookie.get('/users', (req, res) => {
    let users = [];
    
    for (let i = 0; i < 10; i++) {
        users.push(generateUser());
    }

    logger.info('Generación de usuarios - src/Routes/Pruebas/pruebas.router.js', { count: users.length });
    res.send({
        status: 'success',
        payload: users
    });
});

routerCookie.get('/current', (req, res) => {
    logger.info('Acceso a datos sensibles - src/Routes/Pruebas/pruebas.router.js', { user: req.session.user });
    res.send('datos sensibles que solo puede ver el admin');
});

// Sesión acceso y cantidad de visitas al sitio
routerCookie.get('/session', (req, res) => {
    if (req.session.counter) {
        req.session.counter++;
        logger.info('Contador de visitas incrementado - src/Routes/Pruebas/pruebas.router.js', { count: req.session.counter });
        res.send(`se ha visitado el sitio ${req.session.counter} veces.`);
    } else {
        req.session.counter = 1;
        logger.info('Primera visita al sitio - src/Routes/Pruebas/pruebas.router.js');
        res.send('Bienvenidos');
    }
});

// Crear endpoint para métodos de cookie
routerCookie.get('/setCookie', (req, res) => {
    res.cookie('cookie', 'mensaje por cookie', { maxAge: 1000000 }).send('cookieRespuesta');
    logger.info('Cookie establecida - src/Routes/Pruebas/pruebas.router.js', { name: 'cookie', value: 'mensaje por cookie' });
});

// Crear endpoint para métodos de cookie firmada
routerCookie.get('/setCookieSigned', (req, res) => {
    res.cookie('cookie', 'mensaje por cookie', { maxAge: 1000000, signed: true }).send('cookie signed');
    logger.info('Cookie firmada establecida - src/Routes/Pruebas/pruebas.router.js', { name: 'cookie', value: 'mensaje por cookie' });
});

routerCookie.get('/getCookie', (req, res) => {
    logger.info('Cookies firmadas obtenidas - src/Routes/Pruebas/pruebas.router.js', { cookies: req.signedCookies });
    res.send(req.signedCookies);
});

// Eliminar cookie
routerCookie.get('/deleteCookie', (req, res) => {
    res.clearCookie('cookie').send('cookie borrada');
    logger.info('Cookie eliminada - src/Routes/Pruebas/pruebas.router.js', { name: 'cookie' });
});

export default routerCookie;