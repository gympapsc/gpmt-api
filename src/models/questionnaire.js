const mongoose = require("mongoose")

// tree structure of questions
const questionnaireSchema = new mongoose.Schema({
    name: {type: String, unique: true, required: true },
    root: {type: Boolean, default: false },
    type: { type: String, enum: ["numerical", "radio", "string"], required: true },
    options: [{
        text: { type: String, required: true }
    }],
    next: [{
        condition: { type: mongoose.Schema.Types.Mixed },
        question: { type: mongoose.Schema.Types.ObjectId, ref: "Questionnaire" }
    }]
}, {
    timestamp: {
        createdAt: "timestamp"
    }
})

module.exports = mongoose.model("Questionnaire", questionnaireSchema, "questionnaire")