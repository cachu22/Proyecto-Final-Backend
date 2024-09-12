// Importa el módulo 'fs' para interactuar con el sistema de archivos
import fs from 'fs';
// Importa la constante '__dirname' que contiene el directorio actual desde 'utils.js'
import { __dirname } from './utils.js';
// Importa el objeto 'logger' para registrar mensajes de log desde 'logger.js'
import { logger } from './logger.js';

// Función para manejar la adición de un nuevo producto
export function handleAddProduct(req, res, next) {
    // Obtiene los datos del producto del cuerpo de la solicitud
    const productData = req.body;

    try {
        // Registra un mensaje informativo indicando que se está intentando agregar un nuevo producto
        logger.info('Intentando agregar un nuevo producto con datos - src/utils/crear.js:', productData);

        // Verifica si los datos del producto están presentes y son válidos
        if (!productData || typeof productData !== 'object') {
            // Si los datos no son válidos, responde con un error 400 (Bad Request) y un mensaje de error
            return res.status(400).json({ status: 'error', message: 'Datos del producto no válidos' });
        }

        // Obtiene la lista actualizada de productos desde el gestor
        const updatedProducts = manager.getProducts();

        // Verifica si el código del producto ya está en uso por otro producto
        if (updatedProducts.find(prod => prod.code === productData.code)) {
            // Registra un mensaje informativo indicando que el código ya está en uso
            logger.info('El código del producto ya está en uso - src/utils/crear.js:', productData.code);
            // Responde con un error 400 (Bad Request) y un mensaje de error
            return res.status(400).json({ status: 'error', message: `El código ${productData.code} ya está siendo utilizado por otro producto. Por favor, elija otro código.` });
        }

        // Genera un nuevo ID único para el producto usando el gestor
        const pid = manager.generateUniqueId(updatedProducts);

        // Crea el nuevo producto con los datos proporcionados
        const newProduct = {
            id: newpid,
            status: productData.status,
            title: productData.title,
            description: productData.description,
            price: productData.price,
            thumbnails: productData.thumbnails,
            code: productData.code,
            stock: productData.stock,
            category: productData.category,
            owner: productData.owner
        };

        // Agrega el nuevo producto al array de productos
        updatedProducts.push(newProduct);

        // Guarda los productos actualizados en el archivo 'products.json' en el directorio actual
        fs.writeFileSync(__dirname + '/file/products.json', JSON.stringify(updatedProducts, null, 2));

        // Emite un evento 'productAdded' con los datos del nuevo producto para notificar a los clientes
        io.emit('productAdded', newProduct);

        // Registra un mensaje informativo indicando que el producto se agregó correctamente
        logger.info('Producto agregado correctamente - src/utils/crear.js:', newProduct);
        // Responde con un estado 201 (Created) y un mensaje de éxito
        return res.status(201).json({ status: 'success', message: 'Producto agregado correctamente', product: newProduct });

    } catch (error) {
        // Registra un mensaje de error en caso de que ocurra una excepción
        logger.error('Error al agregar el producto - src/utils/crear.js:', error);
        // Responde con un estado 500 (Internal Server Error) y un mensaje de error
        return res.status(500).json({ status: 'error', message: 'Error al agregar el producto' });
    }
}