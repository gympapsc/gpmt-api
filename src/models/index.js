const User = require("./user")
const Message = require("./message")
const Micturition = require("./micturition")
const Drinking = require("./drinking")
const Questionnaire = require("./questionnaire")
const Answer = require("./answer")
const Photo = require("./photo")
const Stress = require("./stress")
const MicturitionPrediction = require("./micturitionPrediction")
const MicturitionModel = require("./micturitionModel")
const PhotoClassificationModel = require("./photoClassificationModel")
// const Nutrition = require("./nutrition")

module.exports = { 
    User,
    Micturition,
    MicturitionPrediction,
    MicturitionModel,
    // Nutrition,
    PhotoClassificationModel,
    Stress,
    Answer,
    Questionnaire,
    Drinking,
    Message,
    Photo
}
