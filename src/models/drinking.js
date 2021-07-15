const mongoose = require("mongoose")
const { Schema } = mongoose


const drinkingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true }
}, {
    timestamps: {
        createdAt: "timestamp"
    }
})


module.exports = mongoose.model("Drinking", drinkingSchema, "Drinking")
