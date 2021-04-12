const {
    Message,
    Conversation
} = require("./models")


const dispatch = (action, payload, ack) => {
    switch(action) {
        case "ADD_USER_MESSAGE":
            Message.create({
                text: payload.text,
                sender: "user"
            }, ack)
        case "ADD_BOT_MESSAGE":
            Message.create({
                text: payload.text,
                sender: "bot"
            }, ack)
    } 
}

const query = (model, selector, cb) => {
    switch(model) {
        case "MESSAGE":
            Message.findOne(selector, cb)
        case "CONVERSATION":
            Conversation.findOne(selector, cb)
        default:
            console.warn("Unknown model " + model)
    }
}

module.exports = {
    dispatch,
    query
}
