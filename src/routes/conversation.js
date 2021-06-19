const express = require("express")

const forecast = require("../forecast")
const rasa = require("../rasa")

const { query, dispatch } = require("../store")

const router = express()

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

    if(messages) {
        for(let message of messages) {
            if(message.text) {
                let botMessage = await dispatch("ADD_BOT_MESSAGE", { user: req.user, text: message.text })

                events.push({
                    sender: "bot",
                    text: botMessage.text,
                    timestamp: botMessage.timestamp
                })
            } else if(message.custom) {
                let entry = null
                console.log(message.custom)
                switch(message.custom.type) {
                    case "ADD_MICTURITION":
                        entry = await dispatch(message.custom.type, {
                            ...message.custom.payload,
                            date: new Date(message.custom.payload.date[message.custom.payload.date.length - 1])
                        })
                        break
                    case "ADD_STRESS":
                        entry = await dispatch(message.custom.type, {
                            ...message.custom.payload,
                            date: new Date(message.custom.payload.date[message.custom.payload.date.length - 1])
                        })
                        break
                    case "ADD_DRINKING":
                        entry = await dispatch(message.custom.type, {
                            ...message.custom.payload,
                            date: new Date(message.custom.payload.date[message.custom.payload.date.length - 1])
                        })
                        break
                    case "ANSWER_QUESTION":
                        answer = await dispatch(message.custom.type, {
                            ...message.custom.payload
                        })
                        break
                        
                }

                if(entry) {
                    events.push({
                        type: message.custom.type,
                        ...message.custom.payload,
                        timestamp: entry.timestamp,
                        updatedAt: entry.updatedAt,
                        _id: entry._id,
                        date: entry.date
                    })
                }
            }
        }

        // let predictions = await forecast.getPredictions(req.user._id)
        // await dispatch("CREATE_MICTURITION_PREDICTIONS", { predictions })
    }

    // get predictions
    const start = new Date().valueOf()
    const end = start + 24 * 60 * 60 * 1000
    let micturitionPrediction = await query("MICTURITION_PREDICTION", {user: req.user, date: {"$gte": start, "$lte": end} })

    res.json({
        micturitionPrediction,
        events
    })
})

router.get("/", async (req, res) => {
    let messages = await query("MESSAGE", {user: req.user})

    if(messages.length === 0) {
        let botMessages = await rasa.addMessage({ user: req.user , text: "Hallo" })
        if(botMessages) {
            for (let message of botMessages) {
                if(message.text) {
                    let botMessage = await dispatch("ADD_BOT_MESSAGE", {user: req.user, text: message.text })
                    messages.push({
                        sender: "bot",
                        text: botMessage.text,
                        timestamp: botMessage.timestamp
                    })
                }
            }    
        }
    }

    res.json({
        messages
    })
})

module.exports = router