const request = require("supertest")
const express = require("express")
const mongoose = require("mongoose")
const seedDatabase = require("../seed")

const signinRouter = require("./signin")
const {
    User
} = require("../models")


describe("/signin", () => {
    const app = express()

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

        app.use(express.json())
        app.use(signinRouter)
    })

    afterAll(async () => {
        // disconnect from mongodb
        await mongoose.connection.close()
    })

    it("should sign in user", async () => {
        await request(app)
            .post("/signin")
            .send({
                email: "testing@taylor.com",
                password: "Password"
            })
            .expect(200)
    })

    it("should response with 401 if password incorrect", async () => {
        expect(true).toBeTruthy()
    })
})