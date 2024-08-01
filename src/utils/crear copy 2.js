import fs from 'fs';
import { __dirname } from './utils.js';
import { logger } from './logger.js';

// Función para manejar la adición de un nuevo producto
export function handleAddProduct(req, res) {
    const productData = req.body;
    try {
        logger.info('Intentando agregar un nuevo producto con datos - src/utils/crear.js:', productData); // Log de inicio de adición

        // Verificar si los datos del producto están presentes
        if (!productData || typeof productData !== 'object') {
            return res.status(400).json({ status: 'error', message: 'Datos del producto no válidos' });
        }

        // Obtener la lista actualizada de productos
        const updatedProducts = manager.getProducts();

        // Validar si el código del producto ya existe
        if (updatedProducts.find(prod => prod.code === productData.code)) {
            logger.info('El código del producto ya está en uso - src/utils/crear.js:', productData.code); // Log de código en uso
            return res.status(400).json({ status: 'error', message: `El código ${productData.code} ya está siendo utilizado por otro producto. Por favor, elija otro código.` });
        }

        // Generar un nuevo ID único para el producto
        const newProductId = manager.generateUniqueId(updatedProducts);

        // Crear el nuevo producto
        const newProduct = {
            id: newProductId,
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

        // Agregar el nuevo producto al array de productos
        updatedProducts.push(newProduct);

        // Guardar los productos actualizados en el archivo products.json
        fs.writeFileSync(__dirname + '/file/products.json', JSON.stringify(updatedProducts, null, 2));

        // Emitir un evento 'productAdded' con los datos del nuevo producto
        io.emit('productAdded', newProduct);

        logger.info('Producto agregado correctamente - src/utils/crear.js:', newProduct); // Log de éxito
        return res.status(201).json({ status: 'success', message: 'Producto agregado correctamente', product: newProduct });

    } catch (error) {
        logger.error('Error al agregar el producto - src/utils/crear.js:', error); // Log de error
        return res.status(500).json({ status: 'error', message: 'Error al agregar el producto2', error });
    }
}