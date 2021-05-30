const socketio = require("socket.io")
const rasa = require("./rasa")
const bcrypt = require("bcrypt")
const { dispatch, query, userStream} = require("./store")


rasa.init()

module.exports = socket => {

    socket.on("ADD_MESSAGE", ({ text }, ack) => {
        console.log("Received ADD_MESSAGE")
        dispatch("ADD_USER_MESSAGE", { user: socket.user,  text }, (err, doc) => {
            
            socket.emit("ADD_MESSAGE", {
                sender: "user",
                text: doc.text,
                timestamp: doc.timestamp
            })

            rasa.addMessage({user: doc.user, text})
                .then(messages => {
                    if(messages) {
                        // TODO make async
                        for(let m of messages) {
                            dispatch("ADD_BOT_MESSAGE", {user: socket.user, text: m}, (err, doc) => {
                                socket.emit("ADD_MESSAGE", {
                                    sender: "bot",
                                    text: doc.text,
                                    timestamp: doc.timestamp
                                })
                            })
                        }
                    }
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
            ack(entries)
        })
    })

    socket.on("GET_MICTURITION_PREDICTION", ({startDate}, ack) => {
        console.log("Received GET_MICTURITION_PREDICTION")
        query("MICTURITION_PREDICTION", { user: socket.user }, (err, predictions) => {
            if(err) return ack({ err })
            ack(predictions)
        })
    })

    socket.on("GET_DRINKING", ({ startDate }, ack) => {
        console.log("Received GET_DRINKING")
        query("DRINKING", { user: socket.user }, (err, entries) => {
            if(err) return ack({err})
            ack(entries)
        })
    })

    socket.on("GET_STRESS", ({ startDate }, ack) => {
        console.log("Received GET_STRESS")
        query("STRESS", {user: socket.user}, (err, entries) => {
            if(err) return ack({err})
            ack(entries)
        })
    })

    socket.on("GET_USER_INFO", ack => {
        console.log("Received GET_USER_INFO")
        let {
            firstname,
            surname,
            birthDate,
            email,
            height,
            weight,
            sex,
            timestamp
        } = socket.user

        ack({
            firstname,
            surname,
            birthDate,
            email,
            height,
            weight,
            sex,
            timestamp
        })
    })

    socket.on("UPDATE_DRINKING", ({ date, amount, _id}, ack) => {
        console.log("UPDATE_DRINKING")
        dispatch("UPDATE_DRINKING", { user: socket.user, _id, date, amount }, (err, doc) => {
            if(err) return ack({ok: false})
            ack({ok:true})
        })
    })


    socket.on("UPDATE_MICTURITION", ({ date, _id }, ack) => {
        console.log("UPDATE_MICTURITION")
        dispatch("UPDATE_MICTURITION", { user: socket.user, _id, date}, (err, doc) => {
            if(err) return ack({ok: false})
            ack({ok: true})
        })
    })

    socket.on("UPDATE_STRESS", ({date, level, _id}, ack) => {
        dispatch("UPDATE_STRESS", { user: socket.user, _id, date, level }, (err, doc) => {
            if(err) return ack({ ok: false })
            ack({ok: true})
        })
    })

    socket.on("DELETE_STRESS", ({_id}, ack) => {
        dispatch("DELETE_STRESS", { user: socket.user, _id}, (err, doc) => {
            if(err) return ack({ ok: false })
            ack({ok: true})
        })
    })

    socket.on("DELETE_MICTURITION", ({_id}, ack) => {
        dispatch("DELETE_MICTURITION", { user: socket.user, _id}, (err, doc) => {
            if(err) return ack({ ok: false })
            ack({ok: true})
        })
    })

    socket.on("DELETE_DRINKING", ({_id}, ack) => {
        dispatch("DELETE_DRINKING", { user: socket.user, _id}, (err, doc) => {
            if(err) return ack({ ok: false })
            ack({ok: true})
        })
    })

    socket.on("UPDATE_USER", (user, ack) => {
        dispatch("UPDATE_USER", { user, _id: socket.user._id }, (err, doc) => {
            if(err) return ack({ err })
            query("USER", {_id: socket.user._id}, (err, users) => {
                socket.user = users[0]
                ack({
                    ok: true
                })

                userStream.emit(socket.user._id, JSON.stringify({
                    type: "UPDATE_USER",
                    ...user
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
