const request = require("supertest")
const express = require("express")
const { dispatch, query } = require("")

const emailRouter = require("./email")
const app = express()

jest.mock("../store")

describe("/email", () => {

    beforeAll(() => {
        app.use(express.json())
        app.use("/", emailRouter)
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