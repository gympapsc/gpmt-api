const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const router = express.Router()
const { dispatch, query } = require("../store")



router.post("/signup", (req, res) => {
    const user = req.body
    
    console.log(new Date(user.birthDate))

    if(!user) {
        return res.status(400)
    }
 
    bcrypt.hash(user.password, process.env.HASH_SALT_ROUNDS, (err, hash) => {
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
                sex: 'm',
                height: user.height,
                role: 'client'
            },
            (err, user) => {
                console.log(err, user)
                if (err) return res.status(400)
                jwt.sign({
                    user_id: user._id 
                }, process.env.AUTH_SIGN_SECRET, (err, token) => {
                    res.json({
                        bearer: token,
                        user
                    })
                })
            }
        )  
    })
})



module.exports = router
