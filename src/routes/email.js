const express = require("express")

const { query } = require("../store")

const router = express.Router()

router.get("/checkUnique/:email", (req, res) => {
    let email = Buffer.from(req.params.email, "base64").toString()
    query("USER", {email}, (err, users) => {
        if(err) res.json({err})
        
        if(users.length > 0) {
            res.json({
                email,
                isUnique: false 
            })
        } else {
            res.json({
                email,
                isUnique: true
            })
        }
    })
})


module.exports = router