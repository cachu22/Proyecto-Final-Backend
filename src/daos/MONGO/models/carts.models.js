// models/carts.models.js
import { Schema, model } from 'mongoose';

const CartSchema = new Schema({
    products: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'productos'
        },
        quantity: {
            type: Number,
            default: 1 
        }
    }]
});

export const cartsModel = model('Cart', CartSchema);