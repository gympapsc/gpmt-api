const request = require("supertest")
const express = require("express")
const bcrypt = require("bcrypt")
const { dispatch, query } = require("../store")

const signupRouter = require("./signup")
const app = express()


jest.mock("../store")

describe("/signup", () => {

    beforeAll(() => {
        process.env.HASH_SALT_ROUNDS = 3
        process.env.AUTH_SIGN_SECRET = "abc"

        app.use(express.json())
        app.use("/", signupRouter)
    })

    it("should sign up", async () => {
        dispatch.mockImplementation((action, payload, ack) => {
            if(action === "ADD_USER") {
                ack(null, {
                    _id: "1234567890",
                    timestamp: new Date(2000, 0, 1).valueOf(),
                    updatedAt: new Date(2000, 0, 1).valueOf(),
                    firstname: "Testing",
                    surname: "Taylor",
                    email: "testing@taylor.com",
                    passwordHash: bcrypt.hashSync("Password", parseInt(process.env.HASH_SALT_ROUNDS)),
                    weight: 80,
                    height: 180,
                    birthDate: new Date(2000, 0, 1),
                    sex: "m",
                    utterButtons: [],
                    settings: {
                        voiceInput: false,
                        voiceOutput: false,
                        cumulativePrediction: false
                    },
                    micturitionFrequency: 0.0
                })
            }
        })

        await request(app)
            .post("/signup")
            .send({
                user: {
                    firstname: "Bob",
                    surname: "Debug",
                    password: "Password",
                    email: "bob@debug.com",
                    birthDate: new Date(2000, 0, 1),
                    weight: 80,
                    sex: "m",
                    height: 180
                }
            })
            .expect(200)
    })
})