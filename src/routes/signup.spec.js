const request = require("supertest")
const express = require("express")

const signupRouter = require("./signup")
const app = express()

jest.mock("../store")

describe("/signup", () => {

    beforeAll(() => {
        app.use(express.json())
        app.use("/", signupRouter)
    })

    it("should sign up", async () => {
    })
})