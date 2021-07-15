const request = require("supertest")
const express = require("express")
const { dispatch, query } = require("")

const drinkingRouter = require("./drinking")
const app = express()

jest.mock("../store")

describe("/drinking", () => {

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
        app.use("/", drinkingRouter)
    })

    it("should get entries", async () => {
        await request(app)
            .get("/")
            .expect(200)
            .expect("Content-Type", /json/)
            .expect({
                entries: [{
                    _id: "123",
                    timestamp: new Date(2000, 0, 1).valueOf(),
                    updatedAt: new Date(2000, 0, 1).valueOf(),
                    user: "1234567890",
                    date: new Date(2000, 0, 1).valueOf(),
                    amount: 600
                }]
            })
    })
})