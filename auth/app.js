const express = require("express")
const mongoose = require("mongoose")

const app = express()
const authRouter = require("./routes")

const PORT = 8088

mongoose.connect("mongodb://localhost:27017/gpmt", {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true})

app.use(express.json())
app.use(require("cors")({
    origin: 'http://localhost:5000'
}))

app.use(authRouter)

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})
