const express = require("express")
const rasa = require("./rasa")

describe("rasa api", () => {
    let app, server

    beforeAll(done => {
        app = express()
        app.use(express.json())
        app.post("/webhooks/rest/webhook", (req, res) => {
            const { message, sender } = req.body
            // echo back POST request
            res.json([
                {
                    text: message,
                    recipient_id: sender
                }
            ])
        })

        server = app.listen(() => done())
    })

    afterAll(() => {
        server.close()
    })

    it("initialize client", async () => {
        rasa.init(`http://localhost:${server.address().port}`)
        let res = await rasa.addMessage({
            user: {
                _id: "123456789"
            },
            text: "Hello"
        })
        expect(res).toEqual("Hello")
    })
})