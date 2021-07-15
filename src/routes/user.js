const express = require("express")

const { dispatch, query } = require("../store")

const router = express.Router()

router.get("/", (req, res) => {
    let {
        firstname,
        surname,
        birthDate,
        sex,
        email,
        timestamp,
        weight,
        height,
        utterButtons,
        settings,
        micturitionFrequency
    } = req.user
    
    res.json({
        user: {
            firstname,
            surname,
            birthDate,
            sex,
            email,
            timestamp,
            weight,
            height,
            utterButtons,
            settings,
            micturitionFrequency
        }
    })
})

router.put("/", async (req, res) => {
    let {
        firstname,
        surname,
        birthDate,
        sex,
        email,
        timestamp,
        weight,
        height,
        settings
    } = req.body

    await dispatch("UPDATE_USER", { 
        _id: req.user._id, 
        firstname, 
        surname, 
        birthDate, 
        sex, 
        email, 
        timestamp, 
        weight, 
        height,
        settings
    })
    
    res.json({
        ok: true
    })
})

module.exports = router