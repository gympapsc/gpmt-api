const mongoose = require("mongoose")


const micturitionModelSchema = new mongoose.Schema({
    active: { type: Boolean, default: false }
}, {
    timestamps: {
        createdAt: "timestamp"
    }
})


module.exports = mongoose.model("MicturitionModel", micturitionModelSchema, "MicturitionModels")


