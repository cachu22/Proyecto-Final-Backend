import mongoose from 'mongoose';

const messageCollection = 'messages';

const messageSchema = new mongoose.Schema({
    user: {
        type: String,
        required: [true, 'El campo user es obligatorio'],
        trim: true,
        minlength: [1, 'El campo user no puede estar vacío']
    },
    message: {
        type: String,
        required: [true, 'El campo message es obligatorio'],
        trim: true,
        minlength: [1, 'El campo message no puede estar vacío']
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Modelo ODM
export const messageModel = mongoose.model(messageCollection, messageSchema);