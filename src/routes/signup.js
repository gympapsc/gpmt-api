const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const router = express.Router()
const { dispatch, query } = require("../store")


router.post("/signup", (req, res) => {
    if(!req.body.user) {
        return res
            .status(400)
            .json({ err: "user object is required"})
    }

    const {user} = req.body
 
    bcrypt.hash(user.password, parseInt(process.env.HASH_SALT_ROUNDS), (err, hash) => {
        if(err) {
            return res
                .status(500)
                .json({ err: "Server error"})
        }

        dispatch(
            "ADD_USER",
            {
                firstname: user.firstname,
                surname: user.surname,
                passwordHash: hash,
                email: user.email,
                birthDate: new Date(user.birthDate),
                weight: user.weight,
                sex: user.sex,
                height: user.height,
                role: "user"
            },
            (err, user) => {
                // TODO validate incoming data

                if (err) {
                    return res.status(400)
                }
                jwt.sign({
                    user_id: user._id 
                }, process.env.AUTH_SIGN_SECRET, (err, token) => {
                    res
                        .cookie("authToken", token, {
                            sameSite: "none",
                            secure: true,
                            domain: process.env.DOMAIN_NAME
                        })
                        .json({
                            ok: true
                        })
                })
            }
        )  
    })
})


module.exports = router
