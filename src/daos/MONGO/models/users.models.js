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
    role: { type: String, enum: ['user', 'admin', 'premium'], default: 'user' },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

// ODM 
export const userModel = model(userCollection, userSchema);