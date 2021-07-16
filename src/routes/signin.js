const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const router = express.Router()
const { dispatch, query } = require("../store")


router.post("/signin", (req, res) => {
    const {email, password} = req.body
    query(
        "USER",
        { email },
        (err, users) => {
            if (err) return res.status(401)
            if (users.length === 0) return res.status(400)
            const user = users[0]
            bcrypt.compare(password, user.passwordHash)
                .then(valid => {
                    if(valid) {
                        jwt.sign({
                            user_id: user._id
                        },
                        process.env.AUTH_SIGN_SECRET, 
                        (err, token) => {
                            res
                                .cookie("authToken", token, {
                                    sameSite: "none",
                                    secure: process.env.NODE_ENV === "production",
                                })
                                .json({
                                    ok: true
                                })
                        })
                    } else {
                        res
                            .status(401)
                            .json({ err: "Invalid credentials" })
                    }
                })
        }
    )
})


router.post("/signin/admin", (req, res) => {
    const {password} = req.body
    query(
        "ADMIN",
        { role: "admin" },
        (err, users) => {
            if (err) return res.status(401)
            if (users.length === 0) return res.status(400)
            const user = users[0]
            bcrypt.compare(password, user.passwordHash)
                .then(valid => {
                    if(valid) {
                        jwt.sign({
                            user_id: user._id
                        },
                        process.env.AUTH_SIGN_SECRET, 
                        (err, token) => {
                            res
                                .cookie("authToken", token, {
                                    sameSite: "none",
                                    secure: process.env.NODE_ENV === "production",
                                })
                                .json({
                                    ok: true
                                })
                        })
                    } else {
                        res
                            .status(400)
                            .json({ err: "Invalid credentials" })
                    }
                    
                })
        }
    )
})

module.exports = router
