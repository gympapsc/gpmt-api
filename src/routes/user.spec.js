const request = require("supertest")
const express = require("express")

const userRouter = require("./user")
const app = express()

jest.mock("../store")

describe("/signup", () => {

    beforeAll(() => {
        app.use(express.json())
        app.use("/", userRouter)
    })

    it("should check uniqueness of email address", async () => {
        let base64Email = Buffer.from("testing@taylor.com").toString("base64")
        await request(app)
            .get(`/checkUnique/${base64Email}`)
            .expect(200)
            .expect("Content-Type", /json/)
            .expect({
                email: "testing@taylor.com",
                isUnique: false
            })
    })
})