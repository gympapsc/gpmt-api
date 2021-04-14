const passport = require("passport")
const jwt = require("jsonwebtoken")
const { dispatch, query } = require("./store")
const BearerStrategy = require("passport-http-bearer").Strategy


// passport.use(
//     new BearerStrategy(
//         (token, done) => {
//             jwt.verify(token, process.env.AUTH_SIGN_SECRET, (err, decoded) => {
//                 if(err) return done(err)
//                 query("USER", {_id: decoded.user_id}, (err, users) => {
//                     if(err) return done(err)
//                     done(null, users[0])
//                 })
//             })
//         }
//     )
// )

const socketAuthMiddleware = (socket, next) => {
    const token = socket.handshake.auth.bearer
    if (token) {
        jwt.verify(token, process.env.AUTH_SIGN_SECRET, (err, decoded) => {
            if (err) return console.log("Invalid JWT")
            query("USER", {_id: decoded.user_id}, (err, users) => {
                if(err) return next(new Error("Invalid credentials"))
                socket.user = users[0]
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
    // http: () => {
    //     return passport.authenticate('bearer', {session: false})
    // }
}
