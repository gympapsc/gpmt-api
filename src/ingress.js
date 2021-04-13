const socketio = require("socket.io")
const { dispatch, query } = require("./store")

module.exports = socket => {

    socket.on("ADD_MESSAGE", ({ text }, ack) => {
        dispatch("ADD_USER_MESSAGE", { text, user: socket.user }, (err, doc) => {
            if (err) return ack(err)
            ack(doc)
            dispatch("ADD_BOT_MESSAGE", {text, user: socket.user }, (err, doc) => {
                socket.emit("ADD_MESSAGE", doc)
            })
        })
    })

    socket.on("GET_MESSAGES", ({ startDate }, ack) => {
        console.log(startDate)
        query("MESSAGE", { user: socket.user }, (err, messages) => {
            console.log("GET_MESSAGES", err, messages)
            ack(messages)
        })
    })

    socket.on("GET_USER_INFO", ack => {
        ack(socket.user)
    })
}
