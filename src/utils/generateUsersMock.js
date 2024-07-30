import { faker } from '@faker-js/faker';
import crypto from 'crypto';
import { logger } from './logger.js';

export function generateProducts() {
    const product = {
        title: faker.commerce.productName(),
        price: faker.commerce.price(),
        departament: faker.commerce.department(),
        stock: parseInt(faker.string.numeric()),
        description: faker.commerce.productDescription(),
        id: faker.database.mongodbObjectId(),
        thumbnail: faker.image.url()        
    };
    logger.info('Producto generado - src/utils/generateUsersMock.js:', product); // Log del producto generado
    return product;
}

export const generateUser = () => {
    // Cuantos productos agregamos como limite '0' - '9'
    let numOfProducts = parseInt(faker.string.numeric(1, { bannedDigits: ['0'] }));
    logger.info('Número de productos a generar - src/utils/generateUsersMock.js:', numOfProducts); // Log del número de productos a generar

    let products = [];
    for (let i = 0; i < numOfProducts; i++) {
        products.push(generateProducts());
    }

    const user = {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        sex: faker.person.sex(),
        birthDate: faker.date.birthdate(),
        phone: faker.phone.number(),
        image: faker.image.avatar(),
        id: faker.database.mongodbObjectId(),
        _id: crypto.randomUUID(),
        email: faker.internet.email(),
        products
    };

    logger.info('Usuario generado - src/utils/generateUsersMock.js:', user); // Log del usuario generado
    return user;
};