const jwt = require("jsonwebtoken")
const { dispatch, query } = require("./store")


const socketioSecure = (socket, next) => {
    
    const token = socket.handshake.auth.bearer
    if (token) {
        jwt.verify(token, AUTH_TOKEN_SECRET, (err, decoded) => {
            if (err) return console.log("Invalid JWT")
            query("USER", {id: decoded.user_id}, (err, user) => {
                if(err) return console.log("Invalid user id")
                socket.user = user
                next()
            })
        })
    } else {
        console.warn("Unauthenticated request")
    }
}

module.exports = socketioSecure
