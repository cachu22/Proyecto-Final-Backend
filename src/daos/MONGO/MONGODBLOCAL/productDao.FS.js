import fs from 'fs'; // Importa fs como un módulo ES
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { logger } from '../../../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ProductDaoFS {
  constructor(filePath) {
    this.filePath = filePath;
  }

  // Método para obtener la lista de productos desde el archivo
  getProductsFromFile() {
    logger.info("Ruta del archivo de productos - Log de /src/daos/MONGO/MONGODBLOCAL/productDao.fs.js:", this.filePath);
    if (!fs.existsSync(this.filePath)) {
        logger.info("El archivo de productos no existe - Log de /src/daos/MONGO/MONGODBLOCAL/productDao.fs.js.");
        return [];
    }
    const data = fs.readFileSync(this.filePath, 'utf8');
    if (!data.trim()) {
        logger.info("El archivo de productos está vacío - Log de /src/daos/MONGO/MONGODBLOCAL/productDao.fs.js.");
        return [];
    }
    return JSON.parse(data);
  }

  // Método para guardar la lista de productos en el archivo
  saveProductsToFile(products) {
    fs.writeFileSync(this.filePath, JSON.stringify(products, null, 2));
  }

  // Método para obtener todos los productos
  getProducts() {
    return this.getProductsFromFile();
  }

  // Método para agregar un nuevo producto
  addProduct(product) {
    const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category']; // Campos obligatorios
    for (const field of requiredFields) {
      if (!(field in product)) {
        throw new Error(`El campo ${field} es obligatorio.`);
      }
    }

    const products = this.getProductsFromFile(); // Obtiene la lista de productos desde el archivo

    // Validación para evitar códigos de productos repetidos
    if (products.find(prod => prod.code === product.code)) {
      throw new Error(`El código ${product.code} ya está siendo utilizado por otro producto.`);
    }
    if (products.find(prod => prod.id === product.id)) {
      throw new Error(`El ID ${product.id} ya está siendo utilizado por otro producto.`);
    }

    // Generar un ID único automáticamente
    const newProductId = this.generateUniqueId(products);

    // Establecer status por defecto y asegurarse de que thumbnails sea un array
    const newProduct = {
      id: newProductId, // Utiliza el nuevo ID generado automáticamente
      status: true, // Status es true por defecto
      thumbnails: [], // Inicializa thumbnails como un array vacío
      ...product
    };

    // Agregar el nuevo producto a la lista de productos
    products.push(newProduct);
    this.saveProductsToFile(products); // Guarda la lista de productos actualizada en el archivo

    return newProduct; // Devuelve el nuevo producto agregado
  }

  // Método para generar un ID único para un nuevo producto
  generateUniqueId(products) {
    logger.info("Entrando en generateUniqueId");
    
    // Obtener todos los IDs existentes
    const existingIds = new Set(products.map(product => product.id));
    logger.info("Existing IDs - Log de /src/daos/MONGO/MONGODBLOCAL/productDao.fs.js:", existingIds);

    // Iniciar desde 1
    let newId = 1;

    // Mientras el nuevo ID ya exista en la lista de IDs
    while (existingIds.has(newId)) {
      logger.info(`El ID ${newId} ya existe en la lista de IDs - Log de /src/daos/MONGO/MONGODBLOCAL/productDao.fs.js`);
      
      // Incrementar el ID
      newId++;
    }
    
    logger.info("Nuevo ID único - Log de /src/daos/MONGO/MONGODBLOCAL/productDao.fs.js:", newId);

    // Devolver el nuevo ID único
    return newId;
  }

  // Método para obtener un producto por su ID
  getProductById(productId) {
    const products = this.getProductsFromFile(); // Obtiene la lista de productos desde el archivo
    return products.find(product => product.id === productId); // Busca y retorna el producto con el ID especificado
  }

  // Método para actualizar un producto
  updateProduct(productId, updatedFields) {
    const products = this.getProductsFromFile(); // Obtiene la lista de productos desde el archivo
    const index = products.findIndex(product => product.id === productId); // Encuentra el índice del producto con el ID especificado
    if (index !== -1) { // Si se encuentra el producto
      // Excluye la propiedad 'id' del objeto updatedFields para evitar que se actualice
      const { id, ...fieldsToUpdate } = updatedFields;
      products[index] = { ...products[index], ...fieldsToUpdate }; // Actualiza los campos del producto
      this.saveProductsToFile(products); // Guarda la lista de productos actualizada en el archivo
      return products[index]; // Retorna el producto actualizado
    } else {
      throw new Error('Producto no encontrado'); // Lanza un error si no se encuentra el producto
    }
  }

  // Método para eliminar un producto
  deleteProduct(productId) {
    let products = this.getProductsFromFile(); // Obtiene la lista de productos desde el archivo
    products = products.filter(product => product.id !== productId); // Filtra los productos para eliminar el producto con el ID especificado
    this.saveProductsToFile(products); // Guarda la lista de productos actualizada en el archivo
  }

  // Método para imprimir los productos almacenados en el archivo
  printProductsFromFile() {
    const products = this.getProductsFromFile();
    logger.info('Productos en el archivo- Log de /src/daos/MONGO/MONGODBLOCAL/productDao.fs.js', products);
  }
}

// Creación de una instancia de ProductDaoFS con la ruta del archivo de productos
const manager = new ProductDaoFS(`${__dirname}/file/products.json`);

// Exporta la clase ProductDaoFS para su uso en otros archivos
export default ProductDaoFS;