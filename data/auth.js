const passport = require("passport")
const jwt = require("jsonwebtoken")
const { dispatch, query } = require("./store")
const BearerStrategy = require("passport-http-bearer").Strategy

const AUTH_TOKEN_SECRET = "abc"

passport.use(
    new BearerStrategy(
        (token, done) => {
            jwt.verify(token, AUTH_TOKEN_SECRET, (err, decoded) => {
                if(err) return done(err)
                query("USER", {_id: decoded.user_id}, (err, user) => {
                    if(err) return done(err)
                    console.log(decoded.user_id)
                    done(null, user)
                })
            })
        }
    )
)

const authMiddleware = (socket, next) => {
    
    const token = socket.handshake.auth.bearer
    if (token) {
        jwt.verify(token, AUTH_TOKEN_SECRET, (err, decoded) => {
            if (err) return console.log("Invalid JWT")
            query("USER", {_id: decoded.user_id}, (err, user) => {
                if(err) return console.log("Invalid user id")
                socket.user = user
                next()
            })
        })
    } else {
        console.warn("Unauthenticated request")
    }
}

module.exports = {
    passport,
    authMiddleware
}

