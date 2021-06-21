const express = require("express")
const forecast = require("../forecast")

const { query, dispatch } = require("../store")

const router = express()

router.get("/", async (req, res) => {
    let entries = await query("MICTURITION", {user: req.user})
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
    start = start - start % 3600
    let end = start + 24 * 60 * 60 * 1000
    let predictions = await query("MICTURITION_PREDICTION", {user: req.user, date: {"$gte": start, "$lte": end} })

    let newestPrediction = Math.max(predictions.map(p => new Date(p.date).valueOf()))

    if(end > newestPrediction) {
        // get new predictions
        predictions = await forecast.getPredictions(req.user._id.toString())
        await dispatch("OVERRIDE_MICTURITION_PREDICTION", { predictions })
        predictions = await query("MICTURITION_PREDICTION", {user: req.user, date: {"$gte": start, "$lte": end} })
    }

    res.json({
        start,
        end,
        predictions
    })
})


module.exports = router