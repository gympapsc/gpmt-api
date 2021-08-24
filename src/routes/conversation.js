const express = require("express")
const net = require("../net")

const rasa = require("../rasa")
const { query, dispatch } = require("../store")

const router = express.Router()

rasa.init()

router.post("/bonjour", async (req, res) => {
    let {
        messages, 
        events, 
        buttons, 
        entries
    } = await rasa.startConversation(req.user)

    res.json({
        ok: true,
        messages,
        buttons
    })
})

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

    if(entries) {

    }
    await net.forecastMicturition(req.user)

    

    res.json({
        buttons,
        micturitionPrediction: forecast,
        events,
        entries,
        messages
    })
})

router.get("/", async (req, res) => {
    let messages = await query("MESSAGE", { user: req.user })

    res.json({
        ok: true,
        messages
    })
})

router.get("/:start/:end", async (req, res) => {
    let { start, end } = req.params
    let messages = await query("MESSAGE", { user: req.user, date: { $gt: new Date(parseInt(start)), $lte: new Date(parseInt(end))}})

    res.json({
        ok: true,
        messages
    })
})

module.exports = router
