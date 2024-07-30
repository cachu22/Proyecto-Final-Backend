import { Router } from "express";

import productsRouterLF from './api/productsRouterFS.js';
import { cartsRouterFS } from './api/carts.routerFS.js'
import sessionsRouter from './api/sessions.router.js';
import usersRouter from './api/users.router.js';
import routerMSG from '../daos/messageDao.mongo.js';
import routerCookie from './Pruebas/pruebas.router.js';
import { cartsRouterMSG } from './api/carts.routerDB.js';
import productsRouterDB from './api/productsRouterDB.js';
import { mocking } from "./api/mockingProducts.router.js";
import { userAuth } from "../middlewares/Auth.middleware.js";

const routerApp = Router()

routerApp.use('/api/products', productsRouterLF);
routerApp.use('/api/carts', cartsRouterFS);
routerApp.use('/api/sessions', sessionsRouter);
routerApp.use('/api/mgProducts', productsRouterDB);
routerApp.use('/api/usersDB', usersRouter);
routerApp.use('/api/cartsDB', cartsRouterMSG);
routerApp.use('/', routerMSG);
routerApp.use('/cookies', routerCookie)

//Mocking de productos
routerApp.use('/mockingproducts', mocking)

export default routerApp