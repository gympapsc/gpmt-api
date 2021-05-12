const request = require("supertest")
const express = require("express")
const bcrypt = require("bcrypt")
const {dispatch, query} = require("../store")
const router = require("./signin") 

jest.mock("../store")

process.env.AUTH_SIGN_SECRET = "123456789"
const userMock = {
    firstname: "timmy",
    surname: "taylor",
    weight: 80,
    height: 180,
    _id: "abcdef123456",
    passwordHash: bcrypt.hashSync("password", parseInt(process.env.HASH_SALT_ROUNDS)),
    email: "timmy@taylor.com"
}

describe("/signin route", () => {
    let app

    beforeAll(() => {
        app = express()
        app.use(express.json())
        app.use(router)
    })

    it("should query for user", done => {
        query.mockImplementation((model, selector, cb) => {
            expect(selector.email).toBeDefined()
            expect(selector.email).toEqual("timmy@taylor.com")
            cb(null, [userMock])
        })

        request(app)
            .post("/signin")
            .send({ email: "timmy@taylor.com", password: "password" })
            .end((err, res) => {
                expect(err).toBeNull()
                expect(res.body.bearer).toBeDefined()
                done()
            })
    })

    it("should return bearer auth token", done => {
        query.mockImplementation((model, selector, cb) => {
            expect(selector.email).toBeDefined()
            expect(selector.email).toEqual("timmy@taylor.com")
            cb(null, [userMock])
        })

        request(app)
            .post("/signin")
            .send({ email: "timmy@taylor.com", password: "password" })
            .end((err, res) => {
                expect(err).toBeNull()
                expect(res.body.bearer).toBeDefined()
                done()
            })
    })

    it("should respond with err for invalid credentials", done => {
        query.mockImplementation((model, selector, cb) => {
            expect(selector.email).toBeDefined()
            expect(selector.email).toEqual("timmy@taylor.com")
            cb(null, [userMock])
        })

        request(app)
            .post("/signin")
            .send({ email: "timmy@taylor.com", password: "incorrect_password" })
            .end((err, res) => {
                expect(err).toBeNull()
                expect(res.body.err).toBeDefined()
                done()
            })  
    })
})