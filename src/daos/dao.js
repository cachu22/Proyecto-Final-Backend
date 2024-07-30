import { logger } from "../utils/logger.js";

export class DaoMongo {
    constructor(model) {
        this.model = model;
    }

    getAll = async () => {
        try {
            const documents = await this.model.find({});
            logger.info('Documentos obtenidos con éxito - Log de /src/daos/dao.js:', documents);
            return documents;
        } catch (error) {
            logger.error('Error al obtener todos los documentos - Log de /src/daos/dao.js:', error.message);
            throw new Error('Error al obtener todos los documentos: ' + error.message);
        }
    }

    get = async (filter) => {
        try {
            const document = await this.model.findOne(filter);
            logger.info('Documento obtenido con éxito - Log de /src/daos/dao.js:', document);
            return document;
        } catch (error) {
            logger.error('Error al obtener el documento - Log de /src/daos/dao.js:', error.message);
            throw new Error('Error al obtener el documento: ' + error.message);
        }
    }

    create = async (document) => {
        try {
            const newDocument = await this.model.create(document);
            logger.info('Documento creado con éxito - Log de /src/daos/dao.js:', newDocument);
            return newDocument;
        } catch (error) {
            logger.error('Error al crear el documento - Log de /src/daos/dao.js:', error.message);
            throw new Error('Error al crear el documento: ' + error.message);
        }
    }

    update = async (filter, updateData) => {
        try {
            const updatedDocument = await this.model.findOneAndUpdate(filter, updateData, { new: true });
            logger.info('Documento actualizado con éxito - Log de /src/daos/dao.js:', updatedDocument);
            return updatedDocument;
        } catch (error) {
            logger.error('Error al actualizar el documento - Log de /src/daos/dao.js:', error.message);
            throw new Error('Error al actualizar el documento: ' + error.message);
        }
    }

    delete = async (filter) => {
        try {
            const deletedDocument = await this.model.findOneAndDelete(filter);
            logger.info('Documento eliminado con éxito - Log de /src/daos/dao.js:', deletedDocument);
            return deletedDocument;
        } catch (error) {
            logger.error('Error al eliminar el documento - Log de /src/daos/dao.js:', error.message);
            throw new Error('Error al eliminar el documento: ' + error.message);
        }
    }
}