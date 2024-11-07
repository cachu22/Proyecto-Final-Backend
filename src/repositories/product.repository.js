import ProductDto from "../dtos/products.dto.js";
import { logger } from "../utils/logger.js";
import { productModel } from "../daos/MONGO/models/products.models.js";

export default class ProductRepository {
    constructor(productDao) {
        this.productDao = productDao;
    }

    // Obtener todos los productos
    getAll = async () => await this.productDao.getAll();

    // Obtener todos los productos con filtros
    getAllPaginated = async (filters) => {
        const products = await this.productDao.getAllPaginated(filters);
        logger.info('Productos en getAllPaginated - product.repository - src/repositories/product.repository.js1', products); // Log info
        return products;
    };

    // Obtener un producto por ID
    getOne = async (filter) => {
        const product = await this.productDao.getOne(filter);
        logger.info('Producto encontrado en getOne - product.repository - src/repositories/product.repository.js', product); // Log info
        return product;
    }

    

    // Crear un nuevo producto
    create = async (productData) => {
        const newProduct = await this.productDao.create(productData);
        logger.info('Producto creado en create - product.repository - src/repositories/product.repository.js', newProduct); // Log info
        return new ProductDto(newProduct);
    };

    // Actualizar un producto
    update = async (id, productData) => {
        const updatedProduct = await this.productDao.update(id, productData);
        logger.info('Producto actualizado en update - product.repository - src/repositories/product.repository.js', updatedProduct); // Log info
        return new ProductDto(updatedProduct);
    };

    // Eliminar un producto
    delete = async (id) => {
        const result = await this.productDao.delete(id);
        logger.info('Producto eliminado en delete - product.repository - src/repositories/product.repository.js', result); // Log info
        return result;
    };

    updateStock = async (pid, quantityChange) => {
        return productModel.findByIdAndUpdate(
            pid,
            { $inc: { stock: quantityChange } }, // Incrementar o decrementar el stock
            { new: true } // Devuelve el documento actualizado
        );
    }
}