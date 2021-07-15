const request = require("supertest")
const express = require("express")

const userRouter = require("./user")
const app = express()

jest.mock("../store")

describe("/signup", () => {

    beforeAll(() => {
        app.use(express.json())
        app.use((req, res, next) => {
            req.user = {
                _id: "1234567890",
                timestamp: new Date(2000, 0, 1).valueOf(),
                updatedAt: new Date(2000, 0, 1).valueOf(),
                firstname: "Testing",
                surname: "Taylor",
                email: "testing@taylor.com",
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
                micturitionFrequency: 1.0
            }
            next()
        })
        app.use("/", userRouter)
    })

    it("should get user", async () => {
        await request(app)
            .get(`/`)
            .expect(200)
            .expect("Content-Type", /json/)
            .expect({
                user: {
                    timestamp: new Date(2000, 0, 1).valueOf(),
                    firstname: "Testing",
                    surname: "Taylor",
                    email: "testing@taylor.com",
                    weight: 80,
                    height: 180,
                    birthDate: new Date(2000, 0, 1).toISOString(),
                    sex: "m",
                    utterButtons: [],
                    settings: {
                        voiceInput: false,
                        voiceOutput: false,
                        cumulativePrediction: false
                    },
                    micturitionFrequency: 1.0
                }
            })
    })
})