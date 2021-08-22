const express = require("express")
const analysis = require("../forecast")

const rasa = require("../rasa")
const { query, dispatch } = require("../store")

const router = express.Router()

rasa.init()

router.post("/utter", async (req, res) => {
    let { text } = req.body
    
    let userMessage = await dispatch("ADD_USER_MESSAGE", {
        user: req.user,
        text
    })

    messages.push({
        sender: "user",
        text,
        timestamp: userMessage.timestamp
    })

    let {
        messages, 
        events, 
        buttons, 
        entries
    } = await rasa.send({
        user: req.user,
        text
    })

    let { forecast } = await net.forecast(req.user._id)
    await dispatch("OVERRIDE_MICTURITION_PREDICTION", { predictions: forecast })

    const start = new Date().valueOf()
    const end = start + 24 * 60 * 60 * 1000
    forecast = await query("MICTURITION_PREDICTION", { user: req.user, date: { $gte: start, $lte: end } })

    res.json({
        buttons,
        micturitionPrediction: forecast,
        events,
        entries
    })
})

router.get("/", async (req, res) => {
    let messages = await query("MESSAGE", { user: req.user })

    res.json({
        messages
    })
})

// router.get("/:start/:end", async (req, res) => {
//     let {start, end} = req.params
//     let messages = await query("MESSAGE", {user: req.user, timestamp: { $gt: new Date(start), $lte: new Date(end) }})

//     if(messages.length === 0) {
//         let botMessages = await rasa.send({ user: req.user , text: "Hallo" })
//         if(botMessages) {
//             for (let message of botMessages) {
//                 if(message.text) {
//                     let botMessage = await dispatch("ADD_BOT_MESSAGE", {user: req.user, text: message.text })
//                     messages.push({
//                         sender: "bot",
//                         text: botMessage.text,
//                         timestamp: botMessage.timestamp
//                     })
//                 }
//             }    
//         }
//     }

//     res.json({
//         messages
//     })
// })


module.exports = router
