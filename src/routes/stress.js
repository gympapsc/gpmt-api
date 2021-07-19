const express = require("express")

const { dispatch, query } = require("../store")

const router = express.Router()

router.get("/", async (req, res) => {
    let entries = await query("STRESS", { user: req.user })

    res.json({
        entries
    })
})

router.put("/:id", async (req, res) => {
    let { id } = req.params
    let { date, level } = req.body
    await dispatch("UPDATE_STRESS", { user: req.user, date, level, _id: id })
    res.json({
        ok: true
    })
})

router.delete("/", async (req, res) => {
    let { id } = req.params
    await dispatch("DELETE_STRESS", { user: req.user, _id: id})
    res.json({
        ok: true
    })    
})

module.exports = router