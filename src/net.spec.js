const express = require("express")
const multer = require("multer")
const net = require("./net")
const mongoose = require("mongoose")
const seedDatabase = require("./seed")

const {
    User, Micturition
} = require("./models")

const inMemoryStorage = multer.memoryStorage()

describe("gpmt-net api", () => {
    let app, server, upload

    beforeAll(done => {
        app = express()
        app.use(express.json())

        upload = multer({ storage: inMemoryStorage })

        app.post("/photo/classification", upload.single("photo"), (req, res) => {
            res.json({
                classification: "Burger"
            })
        })

        app.post("/forecast/micturition",  (req, res) => {

            res.json({
                forecast: [
                    {
                        date: new Date(2000, 0, 1),
                        prediction: 0.7,
                        user: req.body.user
                    },
                    {
                        date: new Date(2000, 0, 1),
                        prediction: 0.3,
                        user: req.body.user
                    },
                    {
                        date: new Date(2000, 0, 1),
                        prediction: 0.2,
                        user: req.body.user
                    }
                ]
            })
        })

        server = app.listen(() => done())
    })

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
    })

    afterAll(async () => {
        server.close()
        await mongoose.connection.close()
    })

    it("should retrieve photo classification", async () => {
        net.init(`http://localhost:${server.address().port}`)

        let user = await User.findOne({ email: "testing@taylor.com" })
        let classification = await net.classifyPhoto(user._id, "1234", Buffer.from("test"))

        expect(classification).toEqual("Burger")
    })

    it("should retrieve micturition forecast", async () => {
        net.init(`http://localhost:${server.address().port}`)

        let user = await User.findOne({ email: "testing@taylor.com" })
        await Micturition.create({
            user,
            date: new Date()
        })

        let forecast = await net.forecastMicturition(user)

        expect(forecast).toBeDefined()
    })
})