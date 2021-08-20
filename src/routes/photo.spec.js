const request = require("supertest")
const express = require("express")
const mongoose = require("mongoose")
const seedDatabase = require("../seed")

const photoRouter = require("./photo")
const {
    Photo,
    User
} = require("../models")


describe("/photo", () => {
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
        app.use(photoRouter)
    })

    afterAll(async () => {
        // disconnect from mongodb
        await mongoose.connection.close()
    })

    afterEach(async () => {
        await Photo.deleteMany({})
    })


    it("should get photos", async () => {
        await request(app)
            .get(`/`)
            .expect(200)
            .expect("Content-Type", /json/)
            .expect({
                photos: []
            })
    })
})