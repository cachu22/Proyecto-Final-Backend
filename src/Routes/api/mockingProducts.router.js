import { Router } from "express";
import { generateProducts } from "../../utils/generateProductsMock.js";
import { logger } from "../../utils/logger.js";

export const mocking = Router();

mocking.get('/', (req, res) => {
    let products = [];

    for (let i = 0; i < 100; i++) {
        products.push(generateProducts());
    }

    logger.info('Productos de mocking generados - src/Routes/api/mockingProducts.router.js', { count: products.length }); // Registro de la cantidad de productos generados

    res.send({
        status: 'success',
        payload: products
    });
});