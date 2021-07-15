const {Schema, model} = require("mongoose")


const micturitionPredictionSchema = new Schema({
    date: { type: Date, required: true },
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    // high: { type: Number, required: true },
    // low:  { type: Number, required: true },
    prediction: { type: Number, required: true }
}, {
    timestamps: {
        createdAt: "timestamp"
    }
})

module.exports = model("MicturitionPrediction", micturitionPredictionSchema, "MicturitionPredictions")