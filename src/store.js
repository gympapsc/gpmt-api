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
            console.log("CREATE_MICTURITION")
            Micturition.create({
                // inject user id
            }, (err, doc) => {
                if (err) return ack(err)
                ack(doc)
            })
            break
        case "CREATE_DRINKING":
            console.log("CREATE_DRINKING")
            Drinking.create({
                amount: payload.amount,
                type: payload.type
            }, (err, doc) => {
                if (err) return ack(err)
            })
            break
        case "CREATE_USER":
            User.create({
                ...payload
            }, ack)
            break
        default:
            ack(new Error('Unknown action ' + action), null)
    }
}

const query = (model, selector, cb) => {
    switch(model) {
        case "MESSAGE":
            Message.find(selector, cb)
            break
        case "CONVERSATION":
            Conversation.find(selector, cb)
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
            console.warn("Unkown model")
            cb({
                err: "Query for unknown model type " + model
            }, null)
            break
    }
}

module.exports = {
    dispatch,
    query
}
