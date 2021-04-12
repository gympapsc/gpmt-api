const http = require("http")
const express = require("express")
const mongoose = require("mongoose")

const createIOServer = require("./io")
const { passport, authMiddleware } = require("./auth")

const app = express()
const httpServer = http.createServer(app)
createIOServer(httpServer, [authMiddleware])

const PORT = 8089

// const micturitionRouter = require("./routes/micturition")
// const drinkingRouter = require("./routes/drinking")
const userRouter = require("./routes/user")

mongoose.connect("mongodb://localhost:27017/gpmt", {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true})

app.use(require("cors")({
    origin: "http://localhost:5000"
}))
app.use(express.json())
app.use(passport.authenticate("bearer", {session: false}))

app.get("/", (req, res) => {
    res.send("Hello from /data")
})

// app.use("/micturition", micturitionRouter)
// app.use("/drinking", drinkingRouter)

app.use("/user", userRouter)

httpServer.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})
