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
                entries: []
            })
    })
})