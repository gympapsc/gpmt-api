const mongoose = require("mongoose")
const { Schema } = mongoose


const hydrationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    type: { type: String, required: true }
}, {
    timestamps: {
        createdAt: "timestamp"
    }
})


module.exports = mongoose.model("Hydration", hydrationSchema, "Hydration")
