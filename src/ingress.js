const socketio = require("socket.io")
const { dispatch, query } = require("./store")

module.exports = socket => {

    socket.on("ADD_MESSAGE", ({ text }, ack) => {
        dispatch("ADD_USER_MESSAGE", { text, user: socket.user }, (err, doc) => {
            if (err) return ack(err)
            ack(doc)
            dispatch("ADD_BOT_MESSAGE", { text, user: socket.user }, (err, doc) => {
                socket.emit("ADD_MESSAGE", doc)
            })
        })
    })

    socket.on("GET_MESSAGES", ({ startDate }, ack) => {
        query("MESSAGE", { user: socket.user }, (err, messages) => {
            ack(messages)
        })
    })

    socket.on("GET_MICTURITION", ({ startDate }, ack) => {
        query("MICTURITION", { user: socket.user }, (err, entries) => {
            ack(entries)
        })
    })

    socket.on("GET_USER_INFO", ack => {
        ack(socket.user)
    })
}
