const mongoose = require("mongoose")

const questionnaireSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true },
    root: {type: Boolean, default: false },
    type: { type: String, enum: ["number", "radio", "string", "bool"], required: true },
    options: [
        {
            title: { type: String, required: true },
            value: { type: String, required: true }
        }
    ],
    // condition: [
    //     {
    //         type: { type: String, require: true},
    //         value: { type: String, require: true}
    //     }
    // ],
    next: [
        {
            _id: { type: mongoose.Schema.Types.ObjectId, ref: "Questionnaire" },
            condition: [
                {
                    type: { type: String, require: true},
                    value: { type: String, require: true}
                }
            ]
        }
    ]
}, {
    timestamps: {
        createdAt: "timestamp"
    }
})

module.exports = mongoose.model("Questionnaire", questionnaireSchema, "Questionnaire")