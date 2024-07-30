// models/carts.models.js
import { Schema, model } from 'mongoose';

const CartSchema = new Schema({
    // user: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true
    // },
    products: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            default: 1 
        }
    }]
});

export const cartsModel = model('Cart', CartSchema);