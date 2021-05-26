const {RedisPubSub, RedisStream} = require("@hakrac/redisutils")
const EventEmitter = require("events")
const {
    Message,
    User,
    Micturition,
    Drinking,
    Questionnaire,
    Answer,
    Photo
} = require("./models")

const actionStream = new RedisStream(
    "actions",
    "gpmt-api",
    process.env.HOSTNAME,
    {
        redisUrl: process.env.REDIS_URL
    }
)

const userStream = new EventEmitter()

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
                user: payload.user,
                date: payload.date
            }, ack)
            break
        case "CREATE_DRINKING":
            console.log("CREATE_DRINKING")
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
        case "UPDATE_USER":
            User.updateOne({
                _id: payload._id
            }, {
                ...payload.user
            }, ack)
            break
        case "USER_SETUP_COMPLETE":
            User.updateOne({
                _id: payload._id
            }, {
                setupCompleted: true
            }, ack)
            break
        case "ANSWER_QUESTION":
            // TODO if answer for user for question exists update answer
            Answer.create({
                user: payload.user,
                answer: payload.answer,
                question: payload.question
            }, ack)
            break
        case "CREATE_PHOTO":
            Photo.create({
                user: payload.user,
                name: payload.name
            }, ack)
            break
        case "DELETE_ALL_PHOTOS":
            Photo.remove({}, ack)
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
        case "QUESTIONNAIRE":
            Questionnaire.find(selector, cb)
            break 
        case "PHOTO":
            Photo.find(selector, cb)
            break
        default:
            throw new Error("Unknown model type " + model)
    }
}

Questionnaire.deleteMany({})
    .then(() => {
        Questionnaire.create({
            root: true,
            type: "string",
            name: "disease",
            next: [
                // {
                //     condition: "ms",
                //     question: new Questionnaire({
                //         type: "string",
                //         name: "form_stress",
                //         next: [],
                //         options: []
                //     })
                // }
            ],
            options: []
        })
    })

module.exports = {
    dispatch,
    query,
    actionStream,
    userStream
}
