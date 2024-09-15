import { Schema, model } from 'mongoose';

const userCollection = 'users';

const documentSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    reference: {
        type: String,
        required: true,
    }
});

const userSchema = new Schema({
    first_name: {
        type: String,
        required: true,
        index: true        
    },
    last_name: String,
    fullname: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    age: Number,
    password: String,
    role: { 
        type: String, 
        enum: ['user', 'premium', 'admin'], 
        default: 'user' 
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    documents: {
        type: [documentSchema],
        default: []
    },
    last_connection: { type: Date, default: null }
});

// ODM 
export const userModel = model(userCollection, userSchema);