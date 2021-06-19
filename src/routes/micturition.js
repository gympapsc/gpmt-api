const express = require("express")

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
    const start = new Date().valueOf()
    const end = start + 24 * 60 * 60 * 1000
    let predictions = await query("MICTURITION_PREDICTION", {user: req.user, date: {"$gte": start, "$lte": end} })

    if(predictions.length === 0) {
        // get new predictions
        predictions = [
            { date: new Date(2021, 5, 18, 23), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 00), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 01), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 02), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 03), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 04), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 05), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 06), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 07), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 08), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 09), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 10), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 11), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 12), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 13), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 14), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 15), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 16), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 17), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 18), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 19), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 20), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 21), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 22), prediction: 0.12, timestamp: new Date()},
            { date: new Date(2021, 5, 19, 23), prediction: 0.12, timestamp: new Date()},
        ]
    }

    res.json({
        start,
        end,
        predictions
    })
})


module.exports = router