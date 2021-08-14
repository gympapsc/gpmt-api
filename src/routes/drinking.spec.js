const request = require("supertest")
const express = require("express")

const drinkingRouter = require("./drinking")
const app = express()


beforeAll(() => {
    // connect to mongodb
    // seed database
})

afterAll(() => {
    // disconnect from mongodb
})

describe("/drinking", () => {

    it("should get entries", async () => {

        // create 

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