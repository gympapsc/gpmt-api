const {
    Message,
    Conversation,
    User,
    Micturition,
    Drinking
} = require("./models")


const dispatch = (action, payload, ack) => {
    switch(action) {
        case "ADD_USER_MESSAGE":
            Message.create({
                text: payload.text,
                sender: "user",
                user: payload.user
            }, ack)
            break
        case "ADD_BOT_MESSAGE":
            Message.create({
                text: payload.text,
                sender: "bot",
                user: payload.user
            }, ack)
            break
        case "CREATE_MICTURITION":
            Micturition.create({
                user: payload.user,
                date: payload.date
            }, ack)
            break
        case "CREATE_DRINKING":
            Drinking.create({
                amount: payload.amount,
                date: payload.date,
                user: payload.user
            }, ack)
            break
        case "CREATE_USER":
            User.create({
                ...payload
            }, ack)
            break
        default:
            throw new Error("Unknown action " + action)
    }
}

const query = (model, selector, cb) => {
    switch(model) {
        case "MESSAGE":
            Message.find(selector, cb)
            break
        case "USER":
            User.find(selector, cb)
            break
        case "DRINKING":
            Drinking.find(selector, cb)
            break
        case "MICTURITION":
            Micturition.find(selector, cb)
            break
        default:
            throw new Error("Unknown model type " + model)
    }
}

module.exports = {
    dispatch,
    query
}
