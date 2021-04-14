const http = require("http")
const { Server } = require("socket.io")
const Client = require("socket.io-client")

const { dispatch, query } = require("./store")

jest.mock("./store")

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

    beforeAll(done => {
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

    afterAll(() => {
        io.close()
        clientSocket.close()
    })

    afterEach(() => {
        dispatch.mockClear()
        query.mockClear()
    })

    it("should dispatch ADD_USER_MESSAGE", done => {
        clientSocket.emit("ADD_MESSAGE", {
            text: "hello world"
        }, message => {
            expect(dispatch).toHaveBeenCalled()
            expect(dispatch.mock.calls[0][0]).toEqual("ADD_USER_MESSAGE")
            expect(dispatch.mock.calls[0][1].text).toEqual("hello world")
            expect(dispatch.mock.calls[0][1].user).toEqual(userMock)
            done()
        })

        clientSocket.on("ADD_MESSAGE", message => {
            expect(dispatch)
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
})
