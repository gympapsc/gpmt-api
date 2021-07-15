const request = require("supertest")
const express = require("express")

const signinRouter = require("./signin")
const app = express()

jest.mock("../store")

describe("/signin", () => {

    beforeAll(() => {
        app.use(express.json())
        app.use("/", signinRouter)

        process.env.AUTH_SIGN_SECRET = "abc"
        process.env.HASH_SALT_ROUNDS = 3
    })

    it("should sign in", async () => {
        await request(app)
            .post("/signin")
            .send({
                email: "testing@taylor.com",
                password: "Password"
            })
            .expect(200)
            .expect("Set-Cookie", /authToken=/)
            .expect({
                ok: true
            })
    })

    it("should response with 401 if password wrong", async () => {
        await request(app)
            .post("/signin")
            .send({
                email: "testing@taylor.com",
                password: "PasswordWRONG"
            })
            .expect(401)
    })
})