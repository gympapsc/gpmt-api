const mongoose = require("mongoose")

const photoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }
}, {
    timestamp: {
        createdAt: "timestamp"
    }
})

module.exports = mongoose.model("Photo", photoSchema, "photos")