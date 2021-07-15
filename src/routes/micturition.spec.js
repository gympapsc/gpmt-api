const request = require("supertest")
const express = require("express")

const micturitionRouter = require("./micturition")
const app = express()

jest.mock("../store")

describe("/micturition", () => {

    beforeAll(() => {
        app.use(express.json())
        app.use("/", micturitionRouter)
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
                        user: "1234567890",
                        date: new Date(2000, 0, 1).valueOf()
                    }
                ]
            })
    })
})