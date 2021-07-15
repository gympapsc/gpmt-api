const mongoose = require("mongoose")

const stressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    date: { type: Date, default: Date.now },
    level: { type: Number, min: 1, max: 5 }
}, {
    timestamps: {
        createdAt: "timestamp"
    }
})

module.exports = mongoose.model("Stress", stressSchema, "Stress")