const jwt = require("jsonwebtoken")
const passport = require("passport")
const BearerStrategy = require("passport-http-bearer").Strategy
const { dispatch, query } = require("./store")

passport.use(
    new BearerStrategy(
        (token, done) => {
            jwt.verify(token, process.env.AUTH_SIGN_SECRET, (err, decoded) => {
                if(err) return done(err)
                query("USER", {_id: decoded.user_id}, (err, users) => {
                    if(err) return done(err)
                    done(null, users[0])
                })
            })
        }
    )
)

const socketAuthMiddleware = (socket, next) => {
    const token = socket.handshake.auth.bearer
    console.log("Socket auth handshake ", socket.handshake.auth)
    if (token) {
        jwt.verify(token, process.env.AUTH_SIGN_SECRET, (err, decoded) => {
            if (err) return console.log("Invalid JWT")
            query("USER", {_id: decoded.user_id}, (err, users) => {
                if(err) return next(new Error("Invalid credentials"))
                socket.user = users[0]
                console.log("Signing in user", users[0].firstname)
                next()
            })
        })
    } else {
        next(new Error("Invalid credentials"))
    }
}


module.exports = {
    socketio: () =>  {
        return socketAuthMiddleware
    },
    http: passport.authenticate("bearer", { session: false })
}
