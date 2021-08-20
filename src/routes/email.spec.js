const request = require("supertest")
const express = require("express")
const mongoose = require("mongoose")
const seedDatabase = require("../seed")

const emailRouter = require("./email")
const {
    User
} = require("../models")


describe("/email", () => {

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
        app.use(emailRouter)
    })

    afterAll(async () => {
        // disconnect from mongodb
        await mongoose.connection.close()
    })

    it("should check uniqueness of email address", async () => {
        let base64Email = Buffer.from("testing@taylor.com").toString("base64")
        await request(app)
            .get(`/checkUnique/${base64Email}`)
            .expect(200)
            .expect("Content-Type", /json/)
            .expect({
                email: "testing@taylor.com",
                isUnique: false
            })

        base64Email = Buffer.from("testing@bob.com").toString("base64")

        await request(app)
            .get(`/checkUnique/${base64Email}`)
            .expect(200)
            .expect("Content-Type", /json/)
            .expect({
                email: "testing@bob.com",
                isUnique: true
            })
    })
})