const socketio = require("socket.io")
const bcrypt = require("bcrypt")
const rasa = require("./rasa")
const { dispatch, query, broker} = require("./store")

rasa.init()

module.exports = socket => {

    socket.on("ADD_MESSAGE", ({ text }, ack) => {
        console.log("Received ADD_MESSAGE")
        dispatch("ADD_USER_MESSAGE", { text, user: socket.user }, (err, doc) => {
            if (err) return ack({err})
            ack({
                ok: true
            })

            broker.emit(socket.user._id.toString(), JSON.stringify({
                type: "ADD_MESSAGE",
                timestamp: doc.timestamp,
                text: doc.text,
                sender: doc.sender
            }))

            rasa.addMessage({ text, user: socket.user })
                .then(botMessage => {
                    if(botMessage === "") return console.log(socket.user._id, " BOT had no respone")
                    dispatch("ADD_BOT_MESSAGE", { text: botMessage, user: socket.user }, (err, doc) => {
                        broker.emit(socket.user._id.toString(), JSON.stringify({
                            type: "ADD_MESSAGE",
                            timestamp: doc.timestamp,
                            text: doc.text,
                            sender: doc.sender
                        }))
                    })
                })
        })
    })

    socket.on("GET_MESSAGES", ({ startDate }, ack) => {
        console.log("Received GET_MESSAGES")
        query("MESSAGE", { user: socket.user }, (err, messages) => {
            if(err) return ack({err})
            ack(messages)
        })
    })

    socket.on("GET_MICTURITION", ({ startDate }, ack) => {
        console.log("Received GET_MICTURITION")
        query("MICTURITION", { user: socket.user }, (err, entries) => {
            if(err) return ack({err})
            console.log("MICTURITION entries ", entries)
            ack(entries)
        })
    })

    socket.on("GET_DRINKING", ({ startDate }, ack) => {
        console.log("Received GET_DRINKING")
        query("DRINKING", { user: socket.user }, (err, entries) => {
            if(err) return ack({err})
            console.log("DRINKING entries ", entries)
            ack(entries)
        })
    })

    socket.on("GET_USER_INFO", ack => {
        console.log("Received GET_USER_INFO")
        ack(socket.user)
    })

    socket.on("UPDATE_USER", (user, ack) => {
        dispatch("UPDATE_USER", { user, _id: socket.user._id }, (err, doc) => {
            if(err) return ack({ err })
            query("USER", {_id: socket.user._id}, (err, users) => {
                socket.user = users[0]
                ack({
                    ok: true
                })

                broker.emit(socket.user._id, JSON.stringify({
                    type: "UPDATE_USER",
                    ...socket.user
                }))

            })
        })
    })

    socket.on("UPDATE_PASSWORD", (password, ack) => {
        bcrypt.hash(password, parseInt(process.env.HASH_SALT_ROUNDS), (err, hash) => {
            if(err) return ack({ err })
            dispatch("UPDATE_USER", { 
                _id: socket.user._id, 
                user: { passwordHash: hash }
            }, (err, doc) => {
                if(err) return ack({ err })
                query("USER", { _id: socket.user._id }, (err, users) => {
                    socket.user = users[0]
                    ack({
                        ok: true
                    })

                })
            })
        })
    })

    return () => {
    }
}
