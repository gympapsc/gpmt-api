const request = require("supertest")
const express = require("express")
const { dispatch, query } = require("")

const conversationRouter = require("./conversation")
const app = express()

jest.mock("../store")

describe("/conversation", () => {

    beforeAll(() => {
        app.use((req, res, next) => {
            req.user = {
                _id: "1234567890",
                timestamp: new Date(2000, 0, 1).valueOf(),
                updatedAt: new Date(2000, 0, 1).valueOf(),
                firstname: "Testing",
                surname: "Taylor",
                email: "testing@taylor.com",
                weight: 80,
                height: 180,
                birthDate: new Date(2000, 0, 1),
                sex: "m"
            }
            next()
        })
        app.use(express.json())
        app.use("/", conversationRouter)
    })

    it("should get messages", done => {
        request(app)
            .get("/")
            .expect(200)
            .expect("Content-Type", /json/)
            .expect({
                messages: [{
                    _id: "12345",
                    timestamp: new Date(2000, 0, 1).valueOf(),
                    updatedAt: new Date(2000, 0, 1).valueOf(),
                    text: "Hallo",
                    sender: "user",
                    user: "1234567890"
                }]
            }, done)
    })
})