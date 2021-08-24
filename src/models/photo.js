const mongoose = require("mongoose")

const photoSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    name: { type: String, default: "" }
}, {
    timestamps: {
        createdAt: "timestamp"
    }
})

photoSchema.index({
    name: "text"
})

module.exports = mongoose.model("Photo", photoSchema, "Photos")