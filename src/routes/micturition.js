const express = require("express")
const analysis = require("../forecast")

const { query, dispatch } = require("../store")

const router = express.Router()

router.get("/", async (req, res) => {
    let { start, end } = req.params
    let entries = await query("MICTURITION", { user: req.user })
    res.json({
        entries
    })
})

router.get("/:start/:end", async (req, res) => {
    let { start, end } = req.params
    let entries = await query("MICTURITION", {user: req.user, date: { $gt: new Date(parseInt(start)), $lte: new Date(parseInt(end)) } })
    res.json({
        entries
    })
})

router.get("/:id", async (req, res) => {
    let {id} = req.params
    let entries = await query("MICTURITION", { user: req.user, _id: id })
    res.json({
        entries
    })  
})

router.put("/:id", async (req, res) => {
    let { date } = req.body
    let { id } = req.params
    await dispatch("UPDATE_MICTURITION", { user: req.user, _id: id, date})
    res.json({
        ok: true
    })
})

router.delete("/:id", async (req, res) => {
    let { id } = req.params
    await dispatch("DELETE_MICTURITION", { user: req.user, _id: id})
    res.json({
        ok: true
    })
})

router.get("/predictions", async (req, res) => {
    let start = new Date().valueOf()
    start = start - start % 3600000
    let end = start + 24 * 60 * 60 * 1000
    let predictions = await query("MICTURITION_PREDICTION", {user: req.user, date: {"$gte": start, "$lte": end} })

    let newestPrediction = Math.max(...predictions.map(p => new Date(p.date).valueOf()))

    if(end > newestPrediction) {
        // get new predictions
        let { forecast } = await analysis.getPredictions(req.user._id.toString())
        await dispatch("OVERRIDE_MICTURITION_PREDICTION", { predictions: forecast })
        predictions = await query("MICTURITION_PREDICTION", { user: req.user, date: {"$gte": start, "$lte": end} })
    }

    res.json({
        start,
        end,
        predictions
    })
})


module.exports = router