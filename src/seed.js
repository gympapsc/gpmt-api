const bcrypt = require("bcrypt")
const {
    Message,
    User,
    Micturition,
    Drinking,
    Questionnaire,
    Answer,
    Photo,
    Stress,
    MicturitionPrediction,
    MicturitionModel,
    ClassificationModel,
    PhotoClassificationModel,
    Nutrition
} = require("./models")
const mongoose = require("mongoose")

module.exports = async function seed() {    
    switch(process.env.NODE_ENV) {
        case "testing":
        case "development":
            await User.deleteMany({})
            await Questionnaire.deleteMany({})
            
            let digestionDisorder = await Questionnaire.create({
                root: false,
                type: "bool",
                name: "digestion_disorder",
                condition: [
                    { value: "", type: false },
                    { value: "", type: true },
                ],
                next: [],
                options: []
            })

            let incontinence = await Questionnaire.create({
                root: false,
                type: "bool",
                name: "incontinence",
                condition: [
                    { value: "", type: false }
                ],
                next: [
                    digestionDisorder._id
                ],
                options: []
            })

            let msTimerange = await Questionnaire.create({
                root: false,
                type: "number",
                name: "ms_timerange",
                condition: [
                    { value: "", type: true }
                ],
                next: [],
                options: []
            })

            let disease = await Questionnaire.create({
                root: true,
                type: "string",
                name: "disease",
                condition: [],
                next: [
                    incontinence._id,
                    msTimerange._id
                ],
                options: []
            })

            await User.create({
                role: "admin",
                email: "hakim@admin.com",
                firstname: "hakim",
                surname: "rachidi",
                sex: "m",
                weight: 80,
                height: 1.80,
                passwordHash: bcrypt.hashSync("Password", parseInt(process.env.HASH_SALT_ROUNDS)),
                birthDate: new Date(2002, 8, 12)
            })

            let testingTaylor = await User.create({
                role: "user",
                email: "testing@taylor.com",
                firstname: "Testing",
                surname: "Taylor",
                sex: "m",
                weight: 90,
                height: 1.80,
                passwordHash: bcrypt.hashSync("Password", parseInt(process.env.HASH_SALT_ROUNDS)),
                birthDate: new Date(2002, 8, 12)
            })

            await User.create({
                role: "user",
                email: "fiona@taylor.com",
                firstname: "Fiona",
                surname: "Taylor",
                sex: "w",
                weight: 80,
                height: 1.80,
                passwordHash: bcrypt.hashSync("Password", parseInt(process.env.HASH_SALT_ROUNDS)),
                birthDate: new Date(2002, 8, 12)
            })

            await Answer.create({
                answer: "Ja",
                question: disease,
                user: testingTaylor
            })

            await Answer.create({
                answer: "Ja",
                question: incontinence,
                user: testingTaylor
            })

            await Micturition.create({
                user: testingTaylor,
                date: new Date()
            })

            await Drinking.create({
                user: testingTaylor,
                date: new Date(),
                type: "Water",
                amount: 0.2
            })

            await Nutrition.create({
                user: testingTaylor,
                date: new Date(),
                type: "Meat",
                mass: 0.3
            })

            await Photo.create({
                user: testingTaylor
            })
            break
        case "production":
            Questionnaire.count({root: true}, (err, n) => {
                if(n === 0) {
                    Questionnaire.create({
                        root: true,
                        type: "string",
                        name: "disease",
                        condition: [],
                        next: [],
                        options: []
                    })   
                }
            })
                
            User.count({ role: "admin" }, (err, n) => {
                if(n === 0) {
                    User.create({
                        role: "admin",
                        email: "hakim@admin.com",
                        firstname: "hakim",
                        surname: "rachidi",
                        sex: "m",
                        weight: 80,
                        height: 180,
                        passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD, parseInt(process.env.HASH_SALT_ROUNDS)),
                        birthDate: new Date(2002, 8, 12)
                    })
                }
            })
            break
    }
}
