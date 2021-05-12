jest.mock("./models")
jest.mock("./models/message")
jest.mock("./models/micturition")
jest.mock("./models/drinking")

const { dispatch, query } = require("./store")
const { 
    Drinking,
    Message,
    Micturition,
    User
} = require("./models")
const { json } = require("express")

const userMock = {
    firstname: "timmy",
    surname: "taylor",
    weight: 80,
    height: 180,
    _id: "abcdef123456",
    passwordHash: "123456789",
    email: "timmy@taylor.com"
}

describe("store dispatch", () => {

    afterEach(() => {
        User.create.mockClear()
        Message.create.mockClear()
        Micturition.create.mockClear()
        Drinking.create.mockClear()
    })


    it("should dispatch CREATE_USER", done => {
        User.create.mockImplementation((obj, cb) => cb())
        dispatch("CREATE_USER", userMock, () => {
            expect(User.create).toBeCalledTimes(1)
            done()
        })
    })

    it("should dispatch ADD_USER_MESSAGE", done => {
        Message.create.mockImplementation((obj, cb) => cb())
        dispatch("ADD_USER_MESSAGE", {
            text: "Hello",
            user: userMock
        }, () => {
            expect(Message.create).toBeCalledTimes(1)
            expect(Message.create.mock.calls[0][0].sender).toEqual("user")

            done()
        })
    })

    it("should dispatch ADD_BOT_MESSAGE", done => {
        Message.create.mockImplementation((obj, cb) => cb())

        dispatch("ADD_BOT_MESSAGE", {
            text: "Hello",
            user: userMock
        }, () => {
            expect(Message.create).toBeCalledTimes(1)
            expect(Message.create.mock.calls[0][0].sender).toEqual("bot")
            done()
        })
    })

    it("should dispatch CREATE_MICTURITION", done => {
        Micturition.create.mockImplementation((obj, cb) => cb())
        dispatch("CREATE_MICTURITION", {
            user: userMock,
            date: new Date()
        }, () => {
            expect(Micturition.create).toBeCalledTimes(1)
            done()
        })
    })

    it("should dispatch CREATE_DRINKING", done => {
        Drinking.create.mockImplementation((obj, cb) => cb())
        dispatch("CREATE_DRINKING", {
            user: userMock,
            date: new Date(),
            amount: 100
        }, () => {
            expect(Drinking.create).toBeCalledTimes(1)
            done()
        })
    })

    it("should UPDATE_USER", done => {
        User.updateOne.mockImplementation((selector, update, cb) => cb())
        dispatch("UPDATE_USER", {
            _id: userMock._id,
            user: {
                email: "timmy@testing.com"
            }
        }, () => {
            expect(User.updateOne).toHaveBeenCalledTimes(1)
            done()
        })
    })

    it("should throw on unknown action", () => {
        expect(() => dispatch("DO_NOTHING", {})).toThrow()
    })
})

describe("store query", () => {

    afterEach(() => {
        User.find.mockClear()
        Message.find.mockClear()
        Micturition.find.mockClear()
        Drinking.find.mockClear()
    })

    it("should find USER", done => {
        User.find.mockImplementation((selector, cb) =>  cb())
        query("USER", {}, () => {
            expect(User.find).toBeCalledTimes(1)
            done()
        })
    })

    it("should find MESSAGE", done => {
        Message.find.mockImplementation((selector, cb) =>  cb())
        query("MESSAGE", {}, () => {
            expect(Message.find).toBeCalledTimes(1)
            done()
        })
    })

    it("should find MICTURITION", done => {
        Micturition.find.mockImplementation((selector, cb) =>  cb())
        query("MICTURITION", {}, () => {
            expect(Micturition.find).toBeCalledTimes(1)
            done()
        })
    })

    it("should find DRINKING", done => {
        Drinking.find.mockImplementation((selector, cb) =>  cb())
        query("DRINKING", {}, () => {
            expect(Drinking.find).toBeCalledTimes(1)
            done()
        })
    })

    it("should throw Error for undefined model", () => {
        expect(() => query("UNKNOWN_MODEL", {})).toThrow()
    })
})
