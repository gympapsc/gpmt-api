const mongoose = require("mongoose")
const { Schema } = mongoose


const userSchema = new Schema({
    email: { type: String, required: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    sex: { type: String, enum: ['m', 'w', 'd'], required: true },
    weight: { type: Number, required: true },
    birthDate: { type: Date, required: true },
    height: { type: Number, required: true, min: 20, max: 300},
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
})

module.exports = mongoose.model("User", userSchema)
