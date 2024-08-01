import mongoose from "mongoose";
import { productModel } from "../models/products.models.js";
import { logger } from "../../../utils/logger.js";

class ProductDaosMongo {
    constructor() {
        this.productModel = productModel;
    }

    // Traer todos los productos con filtrado y ordenamiento
    async getAll() { 
        try {
            const products = await this.productModel.find({});
            logger.info('Todos los productos obtenidos - Log de /src/daos/MONGO/MONGODBNUBE/productsDao.mongo.js:', products);
            return products;
        } catch (error) {
            logger.error('Error al obtener todos los productos - Log de /src/daos/MONGO/MONGODBNUBE/productsDao.mongo.js:', error.message);
            throw new Error('Error al obtener todos los productos: ' + error.message);
        }
    }

    // Traer todos los productos con filtrado y ordenamiento paginados
    async getAllPaginated({ limit = 9, numPage = 1, category, status, sortByPrice, order, explain = false, availability }) {
        try {
            let filter = {};
            if (category) filter.category = category;
            if (availability !== undefined) filter.availability = availability;

            let sort = {};
            if (sortByPrice && order) {
                sort.price = order;
            }

            let query = await this.productModel.paginate(
                filter,
                { 
                    limit, 
                    page: numPage, 
                    sort,
                    lean: true 
                }
            );

            if (explain) {
                logger.info('Explicación de la consulta - Log de /src/daos/MONGO/MONGODBNUBE/productsDao.mongo.js:', await query.explain('executionStats'));
                return await query.explain('executionStats');
            }

            logger.info('Productos obtenidos con éxito - Log de /src/daos/MONGO/MONGODBNUBE/productsDao.mongo.js:', query);
            return query;
        } catch (error) {
            logger.error('Error al obtener productos paginados - Log de /src/daos/MONGO/MONGODBNUBE/productsDao.mongo.js:', error.message);
            throw new Error('Error al obtener productos paginados: ' + error.message);
        }
    }

    // Buscar producto por su ID
    async getOne(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            logger.error('ID de producto inválido - Log de /src/daos/MONGO/MONGODBNUBE/productsDao.mongo.js:', id);
            throw new Error('Invalid product ID');
        }
        try {
            const product = await this.productModel.findOne({ _id: id });
            logger.info('Producto obtenido con éxito - Log de /src/daos/MONGO/MONGODBNUBE/productsDao.mongo.js:', product);
            return product;
        } catch (error) {
            logger.error('Error al obtener el producto - Log de /src/daos/MONGO/MONGODBNUBE/productsDao.mongo.js:', error.message);
            throw new Error('Error al obtener el producto: ' + error.message);
        }
    }

    // Crear un nuevo producto
    async create(productData) {
        try {
            const existingProduct = await this.productModel.findOne({ code: productData.code });
            if (existingProduct) {
                logger.error('El código de producto ya está en uso - Log de /src/daos/MONGO/MONGODBNUBE/productsDao.mongo.js:', productData.code);
                throw new Error('El código ' + productData.code + ' ya está siendo utilizado por otro producto. Por favor, elija otro código.');
            }
            const newProduct = await this.productModel.create(productData);
            logger.info('Producto creado con éxito - Log de /src/daos/MONGO/MONGODBNUBE/productsDao.mongo.js:', newProduct);
            return newProduct;
        } catch (error) {
            logger.error('Error al agregar un nuevo producto - Log de /src/daos/MONGO/MONGODBNUBE/productsDao.mongo.js:', error.message);
            throw new Error('Error al agregar un nuevo producto: ' + error);
        }
    }

    // Actualizar un producto existente
    async update(productId, updatedFields) {
        try {
            const updatedProduct = await this.productModel.findByIdAndUpdate(productId, updatedFields, { new: true });
            logger.info('Producto actualizado con éxito - Log de /src/daos/MONGO/MONGODBNUBE/productsDao.mongo.js:', updatedProduct);
            return updatedProduct;
        } catch (error) {
            logger.error('Error al actualizar el producto - Log de /src/daos/MONGO/MONGODBNUBE/productsDao.mongo.js:', error.message);
            throw new Error('Error al actualizar el producto: ' + error.message);
        }
    }

    // Eliminar un producto
    async delete(productId) {
        try {
            const deletedProduct = await this.productModel.findByIdAndDelete(productId);
            logger.info('Producto eliminado con éxito - Log de /src/daos/MONGO/MONGODBNUBE/productsDao.mongo.js:', deletedProduct);
            return deletedProduct;
        } catch (error) {
            logger.error('Error al eliminar el producto - Log de /src/daos/MONGO/MONGODBNUBE/productsDao.mongo.js:', error.message);
            throw new Error('Error al eliminar el producto: ' + error.message);
        }
    }
}

export default ProductDaosMongo;