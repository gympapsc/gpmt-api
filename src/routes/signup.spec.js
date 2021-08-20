const request = require("supertest")
const express = require("express")
const mongoose = require("mongoose")
const seedDatabase = require("../seed")

const signupRouter = require("./signup")
const {
    User
} = require("../models")


describe("/signup", () => {
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
        app.use(signupRouter)
    })

    afterAll(async () => {
        // disconnect from mongodb
        await mongoose.connection.close()
    })

    it("should sign up", async () => {
        let res = await request(app)
            .post("/signup")
            .send({
                user: {
                    firstname: "Bob",
                    surname: "Debug",
                    password: "Password",
                    email: "bob@debug.com",
                    birthDate: new Date(2000, 0, 1),
                    weight: 80,
                    sex: "m",
                    height: 180
                }
            })
            .expect(200)
        
        let user = await User.findOne({firstname: "Bob", surname: "Debug", email: "bob@debug.com" })
        expect(user.birthDate).toEqual(new Date(2000, 0, 1))
        expect(user.sex).toEqual("m")
        expect(user.weight).toEqual(80)
        expect(user.height).toEqual(180)
    })
})