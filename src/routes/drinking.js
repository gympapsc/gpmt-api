const express = require("express")

const { dispatch, query } = require("../store")

const router = express.Router()

router.get("/", async (req, res) => {
    let entries = await query("DRINKING", { user: req.user })
    res.json({
        entries
    })  
})

router.put("/:id", async (req, res) => {
    let { id } = req.params
    let { date, amount } = req.body
    await dispatch("UPDATE_DRINKING", { user: req.user, date, amount, _id: id})
    res.json({
        ok: true
    })
})

router.delete("/:id", async (req, res ) => {
    let { id } = req.params
    await dispatch("DELETE_DRINKING", {user: req.user, _id: id})
    res.json({
        ok: true
    })
})

module.exports = router