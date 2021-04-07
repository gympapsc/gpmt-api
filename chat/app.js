const express = require("express")

const app = express()

app.get("/", (req, res) => {
    res.send("Hello from /chat")
})

app.listen(80, () => {
    console.log("Server is listening ...")
})

