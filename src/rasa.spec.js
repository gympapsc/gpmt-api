const express = require("express")
const mongoose = require("mongoose")

const rasa = require("./rasa")
const seedDatabase = require("./seed")

const {
    User
} = require("./models")

describe("gpmt-rasa api", () => {
    let app, server

    beforeAll(done => {
        app = express()
        app.use(express.json())


        app.post("/webhooks/rest/webhook", (req, res) => {
            let {sender, message} = req.body
            switch(message) {
                case "Hallo":
                    return res.json([
                        {
                            recipient_id: sender,
                            text: "Hallo"
                        }
                    ])
            }
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

    it("initialize client", async () => {
        rasa.init(`http://localhost:${server.address().port}`)

        let user = await User.findOne({ email: "testing@taylor.com" })
        
        let {
            messages,
            events,
            entries,
            buttons
        } = await rasa.send({
            user: user,
            text: "Hallo"
        })

        expect(messages[0].text).toEqual("Hallo")

    })
})