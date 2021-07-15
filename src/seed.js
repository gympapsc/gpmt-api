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


Questionnaire.deleteMany({})
    .then(async () => {
        let q2 = await Questionnaire.create({
            type: "bool",
            name: "incontience",
            condition: [
                { type: "eq", value: "ms" },
                { type: "eq", value: "multiple sklerose" }
            ],
            next: [],
            options: []
        })

        await Questionnaire.create({
            root: true,
            type: "string",
            name: "disease",
            condition: [],
            next: [
                q2._id
            ],
            options: []
        })
    })

User.deleteMany({ role: "admin"})
    .then(() => {
        User.create({
            role: "admin",
            email: "hakim@admin.com",
            firstname: "hakim",
            surname: "rachidi",
            sex: "m",
            weight: 80,
            height: 180,
            passwordHash: bcrypt.hashSync("password", parseInt(process.env.HASH_SALT_ROUNDS)),
            birthDate: new Date(2002, 8, 12)
        })
    })