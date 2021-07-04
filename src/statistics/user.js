const express = require("express")

const router = express.Router()

const { query } = require("../store")

router.get("/", async (req, res) => {
    let now = new Date()
    now = now.valueOf() - now.valueOf() % (24 * 3600 * 1000) + 24 * 3600 * 1000
    let registrations = await query("USER_REGISTRATIONS_STATS", { startDate: now - (14 * 24 * 3600 * 1000), endDate: now })
    res.json({
        registrations
    })
})

router.get("/bmi", async (req, res) => {
    let bmi = await query("USER_BMI_STATS", {})
    res.json({
        bmi
    })
})

module.exports = router