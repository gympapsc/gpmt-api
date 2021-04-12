const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const router = express.Router()
const { dispatch, query } = require("./store")

// TEMPORARY
const AUTH_TOKEN_SECRET = "abc"
const SALT_ROUNDS = 10


router.post("/signup", (req, res) => {
    const user = req.body
    
    console.log(new Date(user.birthDate))

    if(!user) {
        return res.status(400)
    }
 
    bcrypt.hash(user.password, SALT_ROUNDS, (err, hash) => {
        console.log(hash)
        dispatch(
            "CREATE_USER",
            {
                firstname: user.firstname,
                surname: user.surname,
                passwordHash: hash,
                email: user.email,
                birthDate: new Date(user.birthDate),
                weight: user.weight,
                // gender: user.gender,
                sex: 'm',
                height: user.height,
                role: "client"
            },
            (err, user) => {
                console.log(err, user)
                if (err) return res.status(400)
                jwt.sign({
                    user_id: user._id 
                }, AUTH_TOKEN_SECRET, (err, token) => {
                    res.json({
                        bearer: token,
                        user
                    })
                })
            }
        )  
    })
})


router.post("/signin", (req, res) => {
    const {email, password} = req.body
    console.log(email, password)
    query(
        "USER",
        { email },
        (err, user) => {
            bcrypt.compare(password, user.passwordHash)
                .then(result => {
                    if(result) {
                        jwt.sign({
                            user_id: user._id
                        },
                        AUTH_TOKEN_SECRET, 
                        (err, token) => {
                            res.json({
                                bearer: token
                            })
                        })
                    } else {
                        res.status(401)
                    }
                })
        }
    )
})


module.exports = router
