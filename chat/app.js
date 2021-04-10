const express = require("express")
const axios = require("axios")

const app = express()

app.get("/", (req, res) => {
    res.send("Hello from /chat\n")
    axios.post("rasa-x-rasa-production.rasa:5005/webhooks/rest/webhook", {
        sender: "hakim",
        message: "Hello"
    }).then(d => {
        res.send(d)
    })
})

app.listen(80, () => {
    console.log("Server is listening ...")
})

