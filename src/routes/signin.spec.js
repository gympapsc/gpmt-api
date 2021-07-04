const request = require("supertest")
const express = require("express")

const signinRouter = require("./signin")
const app = express()

jest.mock("../store")

describe("/signin", () => {

    beforeAll(() => {
        app.use(express.json())
        app.use("/", signinRouter)
    })

    it("should sign in", async () => {
        await request(app)
    })
})