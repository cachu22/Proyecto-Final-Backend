import { faker } from '@faker-js/faker';
import crypto from 'crypto';
import { logger } from './logger.js';

export function generateSingleProduct() {
    const product = {
        title: faker.commerce.productName(),
        price: faker.commerce.price(),
        department: faker.commerce.department(),
        stock: parseInt(faker.string.numeric()),
        description: faker.commerce.productDescription(),
        id: faker.database.mongodbObjectId(),
        thumbnail: faker.image.url()
    };
    logger.info('Producto individual generado - src/utils/generateProductsMock.js:', product); // Log del producto individual generado
    return product;
}

export function generateProducts(count = 100) {
    const products = [];
    
    for (let i = 0; i < count; i++) {
        products.push(generateSingleProduct());
    }
    logger.info(`Se generaron ${count} productos - src/utils/generateProductsMock.js`); // Log del número total de productos generados
    return products;
}