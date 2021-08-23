const jwt = require("jsonwebtoken")
const passport = require("passport")
const JwtStrategy = require("passport-jwt").Strategy
const { query } = require("./store")

passport.use(
    new JwtStrategy({
        secretOrKey: process.env.AUTH_SIGN_SECRET,
        jwtFromRequest: req => {
            let token = null
            if(req && req.cookies) {
                token = req.cookies["authToken"]
            }
            return token
        }
    }, (payload, done) => {
        query("USER", {_id: payload.user_id}, (err, users) => {
            if(err) return done(err, false)
            if(users && users[0]) return done(null, users[0])
        })
    })
)


module.exports = {
    http: role => {
        return (req, res, next) => {
            passport.authenticate("jwt", (err, user, info) => {
                if(err) return next(err)
                if(user) {
                    if(user.role === role) {
                        req.user = user

                        // TODO set last active date on user 

                        return next()
                    } else {
                        return res
                            .status(401) 
                            .json({
                                err: "Unauthorized request",
                                user,
                                ok: false
                            })
                    }
                } 
                return res
                    .status(403)
                    .json({
                        err: "Unauthenticated request",
                        ok: false
                    })
            })(req, res, next)
        }
    }
}
