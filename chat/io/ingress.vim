const socketio = require("socket.io")

module.exports = function createIngress(httpServer, dispatch) {

    const io = socketio(httpServer)

    io.on("connection", socket => {
        socket.on("ADD_MESSAGE", (drinking, ack) => {
            dispatch("ADD_MESSAGE", (err, doc) => {
                if (err) return ack(err)
                ack(doc)
            })
        })
    })

}
