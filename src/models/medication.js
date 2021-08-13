const mongoose = require("mongoose")
const { Schema } = mongoose

const medicationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    date: { type: Date, default: Date.now },
    substance: { type: String, required: true },
    mass: { type: Number, required: true }
}, {
    timestamps: {
        createdAt: "timestamp"
    }
})


module.exports = mongoose.model("Medication", medicationSchema, "Medication")