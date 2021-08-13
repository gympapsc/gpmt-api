const express = require("express")
const { query, dispatch } = require("../store")

const router = express.Router()

router.get("/", async (req, res) => {
    let medication = await query("MEDICATION", { user: req.user })
    res.json({
        medication
    })
})

router.put("/:id", async (req, res) => {
    let { id } = req.params
    let { 
        date,
        substance,
        mass
    } = req.body
    await dispatch("UPDATE_MEDICATION", { user: req.user, _id: id, date, mass, substance })
    
    res.json({
        ok: true
    })
})

router.delete("/:id", async (req, res) => {
    let { id } = req.params
    await dispatch("DELETE_MEDICATION", { user: req.user, _id: id })

    res.json({
        ok: true
    })
})

module.exports = router