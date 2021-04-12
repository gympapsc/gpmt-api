const mongoose = require("mongoose")
const { Schema } = mongoose


const messageSchema = new Schema({
    sender: { type: String, enum: ['user', 'bot'], default: 'user'},
    text: { type: String, required: true },
    timestamps: {
        createdAt: 'timestamp'
    }
})

module.exports = mongoose.model("Message", messageSchema) 

