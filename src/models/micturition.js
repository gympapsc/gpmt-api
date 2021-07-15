const mongoose = require("mongoose")
const { Schema } = mongoose


const micturitionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    date: { type: Date, default: Date.now }
}, {
    timestamps: {
        createdAt: "timestamp"
    }
})


module.exports = mongoose.model("Micturition", micturitionSchema, "Micturition")


