const mongoose = require("mongoose")


const photoModelSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    active: { type: Boolean, default: false }
}, {
    timestamps: {
        createdAt: "timestamp"
    }
})


module.exports = mongoose.model("PhotoModel", micturitionSchema, "photoModels")


