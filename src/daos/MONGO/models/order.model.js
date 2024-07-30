import { Schema, model } from "mongoose";

const OrderSchema = new Schema({
    title: String,
    model: {
        type: String,
        enum: ["1998", "1999", "2000"],
        default: "1999"
    },
    price: Number,
    quantity: Number,
    date: Date
})

export const orderModel = model('orders', OrderSchema)