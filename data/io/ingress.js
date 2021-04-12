const socketio = require("socket.io")

module.exports = function createIngress(httpServer, dispatch) {
    socket.on("CREATE_DRINKING", (drinking, ack) => {
        dispatch("CREATE_DRINKING", (err, doc) => {
            if (err) return ack(err)
            ack(doc)
        })
    })
}
