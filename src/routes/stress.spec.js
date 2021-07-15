const request = require("supertest")
const express = require("express")

const stressRouter = require("./stress")
const app = express()

jest.mock("../store")

describe("/stress", () => {

    beforeAll(() => {
        app.use(express.json())
        app.use("/", stressRouter)
    })

    it("should get entries", async () => {
        await request(app)
            .get("/")
            .expect(200)
            .expect("Content-Type", /json/)
            .expect({
                entries: [
                    {
                        _id: "1234",
                        timestamp: new Date(2000, 0, 1).valueOf(),
                        updatedAt: new Date(2000, 0, 1).valueOf(),
                        date: new Date(2000, 0, 1).valueOf(),
                        user: "1234567890",
                        level: 1
                    }
                ]
            })
    })
})