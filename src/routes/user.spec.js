const request = require("supertest")
const express = require("express")
const mongoose = require("mongoose")
const seedDatabase = require("../seed")

const userRouter = require("./user")
const {
    User
} = require("../models")


describe("/user", () => {
    const app = express()
    let user

    beforeAll(async () => {
        // connect to mongodb
        await mongoose.connect(process.env.MONGO_URL, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        await mongoose.connection.db.dropDatabase()
        // seed database
        await seedDatabase()

        user = await User.findOne({})

        app.use(express.json())
        app.use(async (req, res, next) => {
            req.user = user
            next()
        })
        app.use(userRouter)
    })

    afterAll(async () => {
        // disconnect from mongodb
        await mongoose.connection.close()
    })

    

    it("should get user info", async () => {
        let u = JSON.parse(JSON.stringify({
            timestamp: user.timestamp,
            firstname: user.firstname,
            surname: user.surname,
            email: user.email,
            weight: user.weight,
            height: user.height,
            birthDate: user.birthDate,
            sex: user.sex,
            utterButtons: user.utterButtons,
            settings: user.settings
        }))
        
        await request(app)
            .get(`/`)
            .expect(200)
            .expect("Content-Type", /json/)
            .expect({
                user: u
            })
    })
})