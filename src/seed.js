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
    PhotoClassificationModel
} = require("./models")

module.exports = function seed() {
    console.log("Seeding Database")
    
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
    
}
