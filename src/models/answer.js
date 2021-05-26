const mongoose = require("mongoose")

const answerSchema = mongoose.Schema({
    answer: { type: mongoose.Schema.Types.Mixed, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    question: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Questionnaire" }
}, {
    timestamp: {
        createdAt: "timestamp"
    }
})

module.exports = mongoose.model("Answer", answerSchema, "answers")