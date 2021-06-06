const socketio = require("socket.io")
const createIngress = require("./ingress")
const createEgress = require("./egress")

const createIOServer = (httpServer, middlewares=[], options={}) => {
    const io = socketio(httpServer, options)
    
    io.use((socket, next) => {
        console.log(socket.id)
        next()
    })

    for(let middleware of middlewares) {
        io.use(middleware)
    }
    
    io.on("connection", socket => {
        console.log("Socket connected")
        socket.join(socket.user._id)

        socket.on("disconnect", createIngress(io, socket))
        socket.on("disconnect", createEgress(io, socket))
    
    })
}

module.exports = createIOServer
