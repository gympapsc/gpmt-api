const { dispatch, query, broker } = require("./store")

broker.on("ADD_DRINKING", drinking => {
    let d = JSON.parse(drinking)
    query("USER", {_id: d.user}, (err, users) => {
        dispatch("CREATE_DRINKING", { user: users[0], date: new Date(d.date), amount: parseInt(d.amount)}, (err, doc) => {
            console.log("Egress emiting ADD_DRINKING")
            
            // emit user event
            broker.emit(doc.user._id.toString(), JSON.stringify({
                type: "ADD_DRINKING",
                date: doc.date,
                timestamp: doc.timestamp,
                _id: doc._id,
                amount: doc.amount
            }))
        })
    })
})

broker.on("ADD_MICTURITION", micturition => {
    let m = JSON.parse(micturition)
    query("USER", {_id: m.user}, (err, users) => {
        dispatch("CREATE_MICTURITION", {user: users[0], date: new Date(m.date)}, (err, doc) => {
            console.log("Egress emiting ADD_MICTURITION")

            // emit user event
            broker.emit(doc.user._id.toString(), JSON.stringify({
                type: "ADD_MICTURITION",
                date: doc.date,
                timestamp: doc.timestamp,
                _id: doc._id
            }))
        })
    })
})

broker.on("SET_MICTURITION_PREDICTION", p => {
    let {predicitions, user} = JSON.parse(p)
    query("USER", {_id: user}, (err, users) => {
        dispatch("SET_MICTURITION_PREDICTION", predicitions, (err, inserted) => {
            // load and send inserted predictions
        })
    })
})

module.exports = socket => {
    // register socket to user event
    console.log(socket.user._id)
    broker.on(socket.user._id.toString(), m => {
        let message = JSON.parse(m)
        console.log("USER EVENT", message)
        switch(message.type) {
            case "ADD_MICTURITION":
                socket.emit("ADD_MICTURITION", {
                    date: message.date,
                    timestamp: message.timestamp,
                    _id: message._id
                })
                break
            case "ADD_DRINKING":
                socket.emit("ADD_DRINKING", {
                    date: message.date,
                    timestamp: message.timestamp,
                    _id: message._id,
                    amount: message.amount
                })
                break
            case "ADD_MESSAGE":
                socket.emit("ADD_MESSAGE", {
                    timestamp: message.timestamp,
                    text: message.text,
                    sender: message.sender
                })
                break
            case "UPDATE_USER":
                socket.emit("UPDATE_USER", {
                    ...message
                })
                break
            case "SET_MICTURITION_PREDICTION":
                socket.emit("SET_MICTURITION_PREDICTION", {
                    predictions: message.predicitions
                })
            default:
                return
        }
    })

    return () => {
        // on disconnect
        // TODO disconnect user event listener
    }
}