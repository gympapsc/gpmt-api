const express = require("express")

const { dispatch, query } = require("../store")

const router = express()


router.get("/", (req, res) => {
    let {
        firstname,
        surname,
        birthDate,
        sex,
        email,
        timestamp,
        weight,
        height
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
            height
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
        height
    } = req.body

    await dispatch("UPDATE_USER", { _id: req.user._id, firstname, surname, birthDate, sex, email, timestamp, weight, height })
    
    res.json({
        ok: true
    })
})

module.exports = router