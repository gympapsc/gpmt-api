const mongoose = require("mongoose")
const {
    Micturition,
    Drinking,
    User
} = require("./models")


const dispatch = (type, payload, ack) => {
    switch(type) {
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
                // inject user id
                amount: payload.amount,
                type: payload.type
            }, (err, doc) => {
                if (err) return ack(err)
            })
            break
        default:
            console.warn("Unkown action type dispatched: " + type)
            ack()
    }
}

const query = (model, selector, cb) => {
    switch(model) {
        case "USER":
            User.findOne(selector, cb)
            break
        case "DRINKING":
            Drinking.findOne(selector, cb)
            break
        case "MICTURITION":
            Micturition.findOne(selector, cb)
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
