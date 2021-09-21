const express = require("express")

const { dispatch, query } = require("../store")
const router = express.Router()

router.get("/", async (req, res) => {
    let entries = await query("HYDRATION", { user: req.user })
    res.json({
        entries
    })  
})

router.get("/:start/:end", async (req, res) => {
    let {start, end} = req.params
    let entries = await query("HYDRATION", { user: req.user, date: { $gt: new Date(parseInt(start)), $lte: new Date(parseInt(end)) }})
    res.json({
        entries
    })  
})


router.get("/:id", async (req, res) => {
    let {id} = req.params
    let entries = await query("HYDRATION", { user: req.user, _id: id })
    res.json({
        entries
    })  
})

router.put("/:id", async (req, res) => {
    let { id } = req.params
    let { date, amount, type } = req.body
    await dispatch("UPDATE_HYDRATION", { user: req.user, date, type, amount, _id: id})
    res.json({
        ok: true
    })
})

router.delete("/:id", async (req, res ) => {
    let { id } = req.params
    await dispatch("DELETE_HYDRATION", {user: req.user, _id: id})
    res.json({
        ok: true
    })
})


module.exports = router