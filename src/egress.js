const { dispatch, query, actionStream, userStream} = require("./store")


actionStream.on("ADD_DRINKING", d => {
    console.log("ADD_DRINKING ", d)
    let { user, date, amount } = d
    query("USER", {_id: user}, (err, users) => {
        if(users && users[0]) {
            dispatch("CREATE_DRINKING", { user: users[0], date: new Date(date), amount: parseInt(amount)}, (err, doc) => {
                console.log("Egress emiting ADD_DRINKING")
                
                // emit user event
                userStream.emit(doc.user._id.toString(), {
                    type: "ADD_DRINKING",
                    date: doc.date,
                    timestamp: doc.timestamp,
                    _id: doc._id,
                    amount: doc.amount
                })
            })
        }
    })
})

actionStream.on("ADD_MICTURITION", micturition => {
    console.log("ADD_MICTURITION ", micturition)
    let m = micturition
    query("USER", {_id: m.user}, (err, users) => {
        if(users && users[0]) {
            dispatch("CREATE_MICTURITION", {user: users[0], date: new Date(m.date)}, (err, doc) => {
                console.log("Egress emiting ADD_MICTURITION")
    
                // emit user event
                userStream.emit(doc.user._id.toString(), {
                    type: "ADD_MICTURITION",
                    date: doc.date,
                    timestamp: doc.timestamp,
                    _id: doc._id
                })
            })
        }
    })
})

actionStream.on("ADD_STRESS", stress => {
    console.log("ADD_STRESS", stress)
    query("USER", {_id: stress.user}, (err, users) => {
        if(users && users[0]) {
            dispatch("CREATE_STRESS", {user: users[0], date: new Date(stress.date), level: stress.level}, (err, doc) => {
                
                userStream.emit(doc.user._id.toString(), {
                    type: "ADD_STRESS",
                    date: doc.date,
                    timestamp: doc.timestamp,
                    _id: doc._id,
                    level: doc.level
                })
            })
        }
    })
})

actionStream.on("ANSWER_QUESTION", (a) => {
    console.log("ANSWER_QUESTION ", a)
    let { answer, question, user } = a
    query("USER", {_id: user}, (err, users) => {
        if(users && users[0]) {
            dispatch("ANSWER_QUESTION", {user: users[0], answer, question}, (err, doc) => {
                userStream.emit(doc.user._id.toString(), {
                    type: "ANSWER_QUESTION",
                    question: doc.question,
                    answer: doc.answer
                })
            })
        }
    })
})

module.exports = socket => {

    userStream.on(socket.user._id.toString(), message => {
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
            case "ADD_STRESS":
                socket.emit("ADD_STRESS", {
                    timestamp: message.timestamp,
                    level: message.level,
                    date: message.date,
                    _id: message._id
                })
                break
            case "SET_MICTURITION_PREDICTION":
                socket.emit("SET_MICTURITION_PREDICTION", {
                    predictions: message.predicitions
                })
                break
            case "ANSWER_QUESTION":
                socket.emit("ANSWER_QUESTION", {
                    question: message.question,
                    answer: message.answer
                })
                break
            default:
                return
        }
    })

    return () => {
        // on disconnect
        // TODO disconnect user event listener
    }
}