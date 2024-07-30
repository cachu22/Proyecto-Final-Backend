import { objectConfig } from "../config/index.js";

// import cart fs, product fs 

export let ProductsDao
export let CartsDao
export let UsersDao

switch (objectConfig.persistence) {
    case "MEMORY":
        
        break;
    case "FS":
        const { default: ProductDaoFS } = await import("./MONGO/MONGODBLOCAL/productDao.FS.js")
        const { default: CartsDaoFS } = await import ("./MONGO/MONGODBLOCAL/cartsDaoFS.js")
        const { default: UsersDaoFS } = await import ("./MONGO/MONGODBLOCAL/userDao.fs.js")

        ProductsDao = ProductDaoFS
        CartsDao = CartsDaoFS
        UsersDao = UsersDaoFS
        break;

    default:
        // MONGO
        const { default: ProductDaosMongo } = await import("./MONGO/MONGODBNUBE/productsDao.mongo.js")
        const { default: CartDaoMongo } = await import("./MONGO/MONGODBNUBE/cartsDao.mongo.js")
        const { default: UserDaoMongo } = await import("./MONGO/MONGODBNUBE/usersDao.mongo.js")

        ProductsDao = ProductDaosMongo
        CartsDao = CartDaoMongo
        UsersDao = UserDaoMongo 
        break;
}