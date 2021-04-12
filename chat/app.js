const express = require("express")
const http = require("httpServer")
const axios = require("axios")

const authMiddleware = require("./auth")
const createIOServer = require("./io")

const PORT = 8087

const app = express()
const httpServer = http.createServer(app)

createIOServer(httpServer, [authMiddleware])

app.use(express.json())

httpServer.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})

