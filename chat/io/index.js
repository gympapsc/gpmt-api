const socketio = require("socket.io")
const createIngress = require("./ingress")
const createEgress = require("./egress")

const createIOServer = (httpServer, middlewares=[]) => {
    const io = socketio(httpServer, {
        // options
    })
    
    for(let middleware of middleware) {
        io.use(middleware)
    }
    
    io.on("connection", socket => {

        createIngress(socket)
        createEgress(socket)
    
    })
}

module.exports = createIOServer
