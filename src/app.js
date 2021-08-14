const express = require("express")
const cookieParser = require("cookie-parser")

const mongoose = require("mongoose")
const cors = require("cors")
const passport = require("passport")

const auth = require("./auth")
const signinRouter = require("./routes/signin")
const signupRouter = require("./routes/signup")
const emailRouter = require("./routes/email")
const userRouter = require("./routes/user")
const conversationRouter = require("./routes/conversation")
const drinkingRouter = require("./routes/drinking")
const stressRouter = require("./routes/stress")
const micturitionRouter = require("./routes/micturition")
const photoRouter = require("./routes/photo")
const answerRouter = require("./routes/answer")
const speechRouter = require("./routes/speech")
const nutritionRouter = require("./routes/nutrition")
const medicationRouter = require("./routes/medication")

const adminSigninRouter = require("./admin/signin")
const adminRouter = require("./admin")
const seedDatabase = require("./seed")

const PORT = parseInt(process.env.PORT)

const app = express()

let connection = mongoose.connect(process.env.MONGO_URL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

app.use(cors({
    origin: [process.env.APP_URL, process.env.ADMIN_URL],
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())

app.get("/", (req, res) => {
    req.isAuthenticated = function() {
        return typeof this.user !== "undefined"
    }

    req.isUnauthenticated = function() {
        return !this.isAuthenticated()
    }

    res.json({
        health: "ok",
        host: req.hostname,
        secure: req.secure,
        authenticated: req.isAuthenticated(),
        version: process.env.API_VERSION
    })
})

app.use(signinRouter)
app.use(signupRouter)
app.use("/email", emailRouter)
app.use("/photo", auth.http("user"), photoRouter)
app.use("/user", auth.http("user"), userRouter)
app.use("/conversation", auth.http("user"), conversationRouter)
app.use("/drinking", auth.http("user"), drinkingRouter)
app.use("/stress", auth.http("user"), stressRouter)
app.use("/micturition", auth.http("user"), micturitionRouter)
app.use("/answer", auth.http("user"), answerRouter)
app.use("/speech", auth.http("user"), speechRouter)
app.use("/nutrition", auth.http("user"), nutritionRouter)
app.use("/medication", auth.http("user"), medicationRouter)

app.use("/admin/signin", adminSigninRouter)
app.use("/admin", auth.http("admin"), adminRouter)

connection
    .then(async () => {
        await seedDatabase()
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`)
        })
    })
    .catch(() => {
        console.error("Connection to mongo server failed.")
    })
