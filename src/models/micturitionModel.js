const mongoose = require("mongoose")


const micturitionModelSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    active: { type: Boolean, default: false }
}, {
    timestamps: {
        createdAt: "timestamp"
    }
})


module.exports = mongoose.model("MicturitionModel", micturitionSchema, "micturitionModels")


