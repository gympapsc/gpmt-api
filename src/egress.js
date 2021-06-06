const { dispatch, query } = require("./store")

module.exports = (io, socket) => {

    // let cb = message => {
    //     console.log("USER EVENT", message)
    //     switch(message.type) {
    //         case "ADD_MICTURITION":
    //             socket.emit("ADD_MICTURITION", {
    //                 date: message.date,
    //                 timestamp: message.timestamp,
    //                 _id: message._id
    //             })
    //             break
    //         case "ADD_DRINKING":
    //             socket.emit("ADD_DRINKING", {
    //                 date: message.date,
    //                 timestamp: message.timestamp,
    //                 _id: message._id,
    //                 amount: message.amount
    //             })
    //             break
    //         case "ADD_MESSAGE":
    //             socket.emit("ADD_MESSAGE", {
    //                 timestamp: message.timestamp,
    //                 text: message.text,
    //                 sender: message.sender
    //             })
    //             break
    //         case "UPDATE_USER":
    //             socket.emit("UPDATE_USER", {
    //                 ...message
    //             })
    //             break
    //         case "ADD_STRESS":
    //             socket.emit("ADD_STRESS", {
    //                 timestamp: message.timestamp,
    //                 level: message.level,
    //                 date: message.date,
    //                 _id: message._id
    //             })
    //             break
    //         case "SET_MICTURITION_PREDICTION":
    //             socket.emit("SET_MICTURITION_PREDICTION", {
    //                 predictions: message.predicitions
    //             })
    //             break
    //         case "ANSWER_QUESTION":
    //             socket.emit("ANSWER_QUESTION", {
    //                 question: message.question,
    //                 answer: message.answer
    //             })
    //             break
    //         default:
    //             return
    //     }
    // }


    return () => {
    }
}