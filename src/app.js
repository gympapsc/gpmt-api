const express = require("express")
const mongoose = require("mongoose")
const http = require("http")
const cors = require("cors")
const passport = require("passport")

const createIOServer = require("./io")
const bearerAuth = require("./auth")
const signinRouter = require("./routes/signin")
const signupRouter = require("./routes/signup")
const emailRouter = require("./routes/email")
const photoRouter = require("./routes/photo")
const questionnaireRouter = require("./routes/questionnaire")

const PORT = parseInt(process.env.PORT)

const app = express()
const httpServer = http.createServer(app)

mongoose.connect(`mongodb://${process.env.MONGO_URL}:27017/gpmt`, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true})


createIOServer(httpServer, [
    bearerAuth.socketio()
], {
    cors: {
        // TODO set redis adapter
        // TODO set cors origin via env variable
        origins: ["http://localhost:5000"],
        methods: ["GET", "POST"],
        transports: ["polling", "websocket"]
    },
})

app.use(cors({
    // TODO set cors origin via env variable
    origin: "http://localhost:5000"
}))
app.use(express.json())
app.use(passport.initialize())

app.use(signinRouter)
app.use(signupRouter)
app.use("/email", emailRouter)
app.use("/photo", bearerAuth.http, photoRouter)
app.use("/questionnaire", bearerAuth.http, questionnaireRouter)

httpServer.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})
