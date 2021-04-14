const http = require("http")
const { Server } = require("socket.io")
const Client = require("socket.io-client")
const jwt = require("jsonwebtoken")
const { dispatch, query } = require("./store")

const auth = require("./auth")

jest.mock("./store")

process.env.AUTH_SIGN_SECRET = "123456789"
const userMock = {
    firstname: "timmy",
    surname: "taylor",
    weight: 80,
    height: 180,
    _id: "abcdef123456",
    passwordHash: "123456789",
    email: "timmy@taylor.com"
}

describe("socket.io authentication middleware", () => {
    it("should call query with user id", done => {
        let serverSocket, clientSocket
        const httpServer = http.createServer()
        io = new Server(httpServer)
        io.use(auth.socketio())

        query.mockImplementation((model, selector, cb) => {
            cb(null, [userMock])
        })

        httpServer.listen(() => {
            const port = httpServer.address().port

            jwt.sign({ user_id: "abcdef123456" }, process.env.AUTH_SIGN_SECRET, (err, bearer) => {
                clientSocket = new Client(`http://localhost:${port}`, {
                    auth: {
                        bearer
                    }
                })

                clientSocket.on("connect", () => {
                    expect(query.mock.calls[0][0]).toEqual("USER")
                    expect(query.mock.calls[0][1]).toEqual({ _id: "abcdef123456" })
                    io.close()
                    clientSocket.close()
                    done()
                })
            })
        })
    })

    it("should block unauthenticated calls", done => {
        const httpServer = http.createServer()
        io = new Server(httpServer)
        io.use(auth.socketio())

        query.mockImplementation((model, selector, cb) => {
            cb(null, [userMock])
        })

        httpServer.listen(() => {
            const port = httpServer.address().port

            let clientSocket = new Client(`http://localhost:${port}`)

            clientSocket.on("connect", () => {
                // should not be called
                expect(false).toBeTruthy()
                
            })

            clientSocket.on("connect_error", err => {
                // should be called
                // expect(() => err).toThrow(/invalid credentials/)
                io.close()
                clientSocket.close()
                done()
            })
        })
    })
})