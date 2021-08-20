const express = require("express")
const analysis = require("../forecast")

const rasa = require("../rasa")
const { query, dispatch } = require("../store")

const router = express.Router()

rasa.init()

router.post("/utter", async (req, res) => {
    let { text } = req.body
    let events = []
    
    let userMessage = await dispatch("ADD_USER_MESSAGE", {
        user: req.user,
        text
    })

    events.push({
        sender: "user",
        text,
        timestamp: userMessage.timestamp
    })

    let messages = await rasa.addMessage({
        user: req.user,
        text
    })

    let buttons = []

    if(messages) {
        for(let message of messages) {
            if(message.text) {
                console.log("BOT_MESSAGE", message)

                let botMessage = await dispatch("ADD_BOT_MESSAGE", { user: req.user, text: message.text })

                events.push({
                    sender: "bot",
                    text: botMessage.text,
                    timestamp: botMessage.timestamp
                })
            } else if (message.buttons) {
                await dispatch("SET_UTTER_BUTTONS", { user: req.user, buttons: message.buttons })
                buttons = message.buttons
            } else if(message.custom) {
                let entry = null
                let event = null
                switch(message.custom.type) {
                    case "ADD_MICTURITION":
                        entry = await dispatch(message.custom.type, {
                            ...message.custom.payload,
                            date: Array.isArray(message.custom.payload.date) ? 
                                new Date(message.custom.payload.date[message.custom.payload.date.length - 1]) :
                                new Date(message.custom.payload.date)
                        })

                        events.push({
                            type: message.custom.type,
                            timestamp: entry.timestamp,
                            updatedAt: entry.updatedAt,
                            _id: entry._id,
                            date: entry.date
                        })

                        break
                    case "ADD_STRESS":
                        entry = await dispatch(message.custom.type, {
                            ...message.custom.payload,
                            date: Array.isArray(message.custom.payload.date) ? 
                                new Date(message.custom.payload.date[message.custom.payload.date.length - 1]) :
                                new Date(message.custom.payload.date)
                        })

                        events.push({
                            type: message.custom.type,
                            timestamp: entry.timestamp,
                            updatedAt: entry.updatedAt,
                            _id: entry._id,
                            date: entry.date,
                            level: entry.level
                        })

                        break
                    case "ADD_DRINKING":
                        entry = await dispatch(message.custom.type, {
                            ...message.custom.payload,
                            amount: message.custom.payload.amount[message.custom.payload.amount.length - 1],
                            date: Array.isArray(message.custom.payload.date) ? 
                                new Date(message.custom.payload.date[message.custom.payload.date.length - 1]) :
                                new Date(message.custom.payload.date)
                        })

                        events.push({
                            type: message.custom.type,
                            timestamp: entry.timestamp,
                            updatedAt: entry.updatedAt,
                            _id: entry._id,
                            date: entry.date,
                            amount: entry.amount
                        })

                        break
                    case "ANSWER_QUESTION":
                        answer = await dispatch(message.custom.type, {
                            ...message.custom.payload
                        })
                        break
                    case "ADD_NUTRITION":
                        entry = await dispatch(message.custom.type, {
                            ...message.custom.payload,
                            mass: message.custom.payload.mass[message.custom.payload.mass.length - 1],
                            date: Array.isArray(message.custom.payload.date) ? 
                                new Date(message.custom.payload.date[message.custom.payload.date.length - 1]) :
                                new Date(message.custom.payload.date),
                            type: message.custom.payload.type
                        })
                        break
                    case "ADD_MEDICATION":
                        entry = await dispatch(message.custom.type, {
                            ...message.custom.payload,
                            mass: message.custom.payload.mass[message.custom.payload.mass.length - 1],
                            date: Array.isArray(message.custom.payload.date) ? 
                                new Date(message.custom.payload.date[message.custom.payload.date.length - 1]) :
                                new Date(message.custom.payload.date),
                            substance: message.custom.payload.substance
                        })
                        break
                    case "SIGNOUT_USER":
                        event = {
                            type: "SIGNOUT_USER",
                            user: req.user
                        }
                        break                   
                }

                if(event) {
                    events.push(event)
                }
            }
        }

        let { forecast, micturitionFrequency } = await analysis.getPredictions(req.user._id)
        await dispatch("OVERRIDE_MICTURITION_PREDICTION", { predictions: forecast })
        await dispatch("UPDATE_USER", { _id: req.user._id, micturitionFrequency })
        req.user.micturitionFrequency = micturitionFrequency
    }

    const start = new Date().valueOf()
    const end = start + 24 * 60 * 60 * 1000
    let forecast = await query("MICTURITION_PREDICTION", { user: req.user, date: {"$gte": start, "$lte": end} })

    if(buttons.length == 0) {
        await dispatch("SET_UTTER_BUTTONS", { user: req.user, buttons: [] })
    }


    res.json({
        buttons,
        micturitionPrediction: forecast,
        events,
        micturitionFrequency: req.user.micturitionFrequency
    })
})

router.get("/", async (req, res) => {
    let messages = await query("MESSAGE", { user: req.user })

    res.json({
        messages
    })
})

router.get("/:start/:end", async (req, res) => {
    let {start, end} = req.params
    let messages = await query("MESSAGE", {user: req.user, date: { $gt: new Date(start), $lte: new Date(end) }})

    // if(messages.length === 0) {
    //     let botMessages = await rasa.addMessage({ user: req.user , text: "Hallo" })
    //     if(botMessages) {
    //         for (let message of botMessages) {
    //             if(message.text) {
    //                 let botMessage = await dispatch("ADD_BOT_MESSAGE", {user: req.user, text: message.text })
    //                 messages.push({
    //                     sender: "bot",
    //                     text: botMessage.text,
    //                     timestamp: botMessage.timestamp
    //                 })
    //             }
    //         }    
    //     }
    // }

    res.json({
        messages
    })
})


module.exports = router
