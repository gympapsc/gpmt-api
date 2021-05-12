const socketio = require("socket.io")
const createIngress = require("./ingress")
const createEgress = require("./egress")

const createIOServer = (httpServer, middlewares=[], options={}) => {
    const io = socketio(httpServer, options)
    
    for(let middleware of middlewares) {
        io.use(middleware)
    }
    
    io.on("connection", socket => {
        console.log("Socket connected")
        socket.emit("test")

        socket.on("disconnect", createIngress(socket))
        socket.on("disconnect", createEgress(socket))
    
    })
}

module.exports = createIOServer
