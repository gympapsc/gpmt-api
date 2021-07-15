const mongoose = require("mongoose")


const photoClassificationModelSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    active: { type: Boolean, default: false }
}, {
    timestamps: {
        createdAt: "timestamp"
    }
})


module.exports = mongoose.model("PhotoClassificationModel", photoClassificationModelSchema, "PhotoClassificationModels")


