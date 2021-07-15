const request = require("supertest")
const express = require("express")

const photoRouter = require("./photo")
const app = express()

jest.mock("../storage")
jest.mock("../store")

describe("/photo", () => {

    beforeAll(() => {
        app.use(express.json())
        app.use("/", photoRouter)
    })

    it("should get photos", async () => {
        await request(app)
            .get(`/`)
            .expect(200)
            .expect("Content-Type", /json/)
            .expect({
                photos: [{
                    _id: "1234",
                    timestamp: new Date(2000, 0, 1).valueOf(),
                    updatedAt: new Date(2000, 0, 1).valueOf(),
                    user: "1234567890",
                    name: "1"
                }]
            })
    })
})