const http = require("http")
const { Server } = require("socket.io")
const Client = require("socket.io-client")

const { dispatch, query } = require("./store")
const rasa = require("./rasa")

jest.mock("./store")
jest.mock("./rasa")

const userMock = {
    firstname: "timmy",
    surname: "taylor",
    weight: 80,
    height: 180,
    _id: "abcdef123456",
    passwordHash: "123456789",
    email: "timmy@taylor.com"
}

const createIngress = require("./ingress")

describe("socket ingress", () => {
    let io, serverSocket, clientSocket

    beforeEach(done => {
        const httpServer = http.createServer()
        io = new Server(httpServer)

        io.use((socket, next) => {
            socket.user = userMock
            next()
        })

        httpServer.listen(() => {
            const port = httpServer.address().port
            clientSocket = new Client(`http://localhost:${port}`)
            io.on("connection", socket => {
                serverSocket = socket
                createIngress(serverSocket)
            })
            
            clientSocket.on("connect", done)
        })
    })


    afterEach(() => {
        io.close()
        clientSocket.close()
        dispatch.mockClear()
        query.mockClear()
        rasa.init.mockClear()
        rasa.addMessage.mockClear()
    })

    it("should dispatch ADD_USER_MESSAGE", done => {
        rasa.addMessage.mockResolvedValue("hello from rasa")
        dispatch.mockImplementation((action, payload, ack) => ack(null, {}))

        clientSocket.emit("ADD_MESSAGE", {
            text: "hello world"
        }, message => {
            expect(dispatch).toHaveBeenCalled()
            expect(dispatch.mock.calls[0][0]).toEqual("ADD_USER_MESSAGE")
            expect(dispatch.mock.calls[0][1].text).toEqual("hello world")
            expect(dispatch.mock.calls[0][1].user).toEqual(userMock)
            expect(dispatch.mock.calls[1][0]).toEqual("ADD_BOT_MESSAGE")
            done()
        })

    })

    it("should query USER for user info", done => {
        clientSocket.emit("GET_USER_INFO", user => {
            expect(user).toEqual(userMock)
            done()
        })
    })

    it("should query for messages on GET_MESSAGES", done => {
        const startDate = new Date()
        clientSocket.emit("GET_MESSAGES", { startDate }, messages => {
            expect(query).toHaveBeenCalled()
            expect(query.mock.calls[0][0]).toEqual("MESSAGE")
            expect(query.mock.calls[0][1].user).toBeDefined()
            done()
        })
    })

    it("should query for micturition on GET_MICTURITION", done => {
        const startDate = new Date()
        clientSocket.emit("GET_MICTURITION", { startDate }, messages => {
            expect(query).toHaveBeenCalled()
            expect(query.mock.calls[0][0]).toEqual("MICTURITION")
            expect(query.mock.calls[0][1].user).toBeDefined()
            done()
        })
    })

    it("should update user on UPDATE_USER", done => {
        let userUpdate = {
            email: "timmy@testing.com"
        }
        dispatch.mockImplementation((action, payload, ack) => ack())
        query.mockImplementation((model, selection, cb) => cb(null, [{ ...userMock, ...userUpdate }]))

        clientSocket.emit("UPDATE_USER", userUpdate, () => {
            expect(query).toHaveBeenCalled()
            expect(dispatch).toHaveBeenCalled()
            done()
        })
    })

    it("should update password on UPDATE_PASSWORD", done => {
        let passwordUpdate = "password"
        dispatch.mockImplementation((action, payload, ack) => ack())

        clientSocket.emit("UPDATE_PASSWORD", passwordUpdate, () => {
            expect(query).toHaveBeenCalled()
            expect(dispatch).toHaveBeenCalled()
            done()
        })
    })
})
