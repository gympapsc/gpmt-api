const request = require("supertest")
const express = require("express")
const bcrypt = require("bcrypt")
const {dispatch, query} = require("../store")

const router = require("./signup") 

jest.mock("../store")

process.env.AUTH_SIGN_SECRET = "123456789"
const userRequest = {
    firstname: "timmy",
    surname: "taylor",
    weight: 80,
    height: 180,
    password: "password",
    email: "timmy@taylor.com"
}

const userMock = {
    firstname: "timmy",
    surname: "taylor",
    weight: 80,
    height: 180,
    _id: "abcdef123456",
    passwordHash: bcrypt.hashSync("password", parseInt(process.env.HASH_SALT_ROUNDS)),
    email: "timmy@taylor.com"
}

describe("sign up route", () => {
    let app

    beforeAll(() => {
        app = express()
        app.use(express.json())
        app.use(router)
    })

    afterEach(() => {
        dispatch.mockClear();
    });

    it("should create new user", done => {
        dispatch.mockImplementation((action, payload, ack) => {
            ack(null, userMock)
        })

        request(app)
            .post("/signup")
            .send({user: userRequest})
            .end((err, res) => {
                expect(err).toBeNull()
                expect(dispatch).toBeCalledTimes(1)
                expect(dispatch.mock.calls[0][0]).toEqual("CREATE_USER")
                done()
            })
    })

    it("should return auth token", done => {
        dispatch.mockImplementation((action, payload, ack) => {
            ack(null, userMock)
        })

        request(app)
            .post("/signup")
            .send({user: userRequest})
            .end((err, res) => {
                expect(err).toBeNull()
                expect(dispatch).toBeCalledTimes(1)
                expect(dispatch.mock.calls[0][0]).toEqual("CREATE_USER")
                done()
            })
    })
})