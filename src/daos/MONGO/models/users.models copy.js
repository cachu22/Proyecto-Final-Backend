import { Schema, model } from 'mongoose';

const userCollection = 'users';

const userSchema = new Schema({
    first_name: {
        type: String,
        required: true,
        index: true        
    },
    last_name: String,
    fullname: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    age: Number,
    password: String,
    role: {
        type: String,
        enum: ['user', 'user_premium', 'admin'],
        default: 'user'
    }
});

// ODM 
export const userModel = model(userCollection, userSchema);