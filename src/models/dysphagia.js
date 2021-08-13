const mongoose = require("mongoose")
const { Schema } = mongoose

const dysphagiaSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    date: { type: Date, default: Date.now }
}, {
    timestamps: {
        createdAt: "timestamp"
    }
})


module.exports = mongoose.model("Dysphagia", dysphagiaSchema, "Dysphagia")