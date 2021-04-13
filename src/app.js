const express = require("express")
const mongoose = require("mongoose")
const http = require("http")
const cors = require("cors")


const createIOServer = require("./io")
const bearerAuth = require("./auth")
const signinRouter = require("./routes/signin")
const signupRouter = require("./routes/signup")

const PORT = process.env.PORT

const app = express()
const httpServer = http.createServer(app)

mongoose.connect("mongodb://localhost:27017/gpmt", {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true})


createIOServer(httpServer, [
    bearerAuth.socketio()
], {
    cors: {
        origin: "http://localhost:5000",
        methods: ["GET", "POST"],
        transports: ["websocket", "polling"]
    }
})

app.use(cors({
    origin: "http://localhost:5000"
}))
app.use(express.json())

app.use(signinRouter)
app.use(signupRouter)

httpServer.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})