const request = require("supertest")
const express = require("express")
const mongoose = require("mongoose")
const seedDatabase = require("../seed")

const conversationRouter = require("./conversation")
const {
    Message,
    User
} = require("../models")


describe("/conversation", () => {
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
        app.use(conversationRouter)
    })

    afterAll(async () => {
        // disconnect from mongodb
        await mongoose.connection.close()
    })

    afterEach(async () => {
        await Message.deleteMany({})
    })

    it("should get messages", async () => {
        await Message.create({
            sender: "user",
            text: "Hello",
            user
        })

        let res = await request(app)
            .get("/")
            .expect("Content-Type", /json/)
            .expect(200)
        
        let messages = await Message.find({})

        expect(res.body.messages).toEqual(messages)
    })
})