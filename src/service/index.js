import { UsersDao, CartsDao, ProductsDao } from "../daos/factory.js"
import UserRepository from "../repositories/user.repository.js"
import CartRepository from "../repositories/cart.repository.js"
import ProductRepository from "../repositories/product.repository.js"

export const ProductService = new ProductRepository(new ProductsDao());
export const userService = new UserRepository(new UsersDao())
export const cartService = new CartRepository(new CartsDao())