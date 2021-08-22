const axios = require("axios")
const {  dispatch } = require("./store")

let client

let extractLast = arr => {
    return Array.isArray(arr) ? arr[arr.length - 1] : arr
}

let processAction = async action => {
    let event
    let entry

    switch(action.type) {
        case "ADD_MICTURITION":
            entry = await dispatch("ADD_MICTURITION", {
                ...action.payload,
                date: new Date(extractLast(action.payload.date))
            })
            break
        case "ADD_STRESS":
            entry = await dispatch("ADD_STRESS", {
                ...action.payload,
                date: new Date(extractLast(action.payload.date))

            })
            break
        case "ADD_DRINKING":
            entry = await dispatch("ADD_DRINKING", {
                ...action.payload,
                amount: action.payload.amount[action.payload.amount.length - 1],
                date: new Date(extractLast(action.payload.date))
            })
            break
        case "ANSWER_QUESTION":
            entry = await dispatch("ANSWER_QUESTION", {
                ...action.payload
            })
            break
        case "ADD_NUTRITION":
            entry = await dispatch("ADD_NUTRITION", {
                ...action.payload,
                mass: extractLast(action.payload.mass),
                date: new Date(extractLast(action.payload.date)),
                type: action.payload.type
            })
            break
        case "ADD_MEDICATION":
            entry = await dispatch("ADD_MEDICATION", {
                ...action.payload,
                mass: extractLast(action.payload.mass),
                date: new Date(extractLast(action.payload.date)),
                substance: action.payload.substance
            })
            break
        case "SIGNOUT_USER":
            event = {
                type: "SIGNOUT_USER",
                user: req.user
            }
            break
    }

    return {
        event,
        entry
    }
}

let processMessages = async (m, u) => {
    let messages, buttons, entries, events
    for(let message of m) {
        if(message.text) {
            let botMessage = await dispatch("ADD_BOT_MESSAGE", { user: u, text: message.text })

            messages.push({
                sender: "bot",
                text: botMessage.text,
                timestamp: botMessage.timestamp
            })
        } else if(message.buttons) {
            await dispatch("SET_UTTER_BUTTONS", { user: u, buttons: message.buttons })
            buttons.extend(message.buttons)
        } else if(message.custom) {
            let { entry: en, event: ev } = await processAction(message.custom)
            if(en) entries.extend(en)
            if(ev) events.extend(ev)
        }
    }

    if(buttons.length == 0) {
        await dispatch("SET_UTTER_BUTTONS", { user: req.user, buttons: [] })
    }

    return {
        entries,
        messages,
        buttons,
        events
    }
}


module.exports = {
    init: baseURL => {
        // create axios client
        client = axios.create({
            baseURL: baseURL || process.env.RASA_URL,
        })
    },
    send: ({user, text}) => {
        if(client) {
            return client.post("/webhooks/rest/webhook", {
                sender: user._id,
                message: text
            })
                .then(res => res.data)
                .then(messages => {
                    if(messages.length === 0) return null

                    if(messages.every(m => m.recipient_id == user._id)) {
                        return processMessages(messages, user)
                    }
                })
        }   
    }
}
