const express = require("express")

const router = express.Router()

const { query } = require("../store")

router.get("/registrations", async (req, res) => {
    let now = new Date()
    now = now.valueOf() - now.valueOf() % (24 * 3600 * 1000) + 24 * 3600 * 1000
    let stats = await query("USER_REGISTRATIONS_STATS", { startDate: now - (365 * 24 * 3600 * 1000), endDate: now })
    res.json({
        stats,
        ok: true
    })
})

router.get("/bmi", async (req, res) => {
    let bmi = await query("USER_BMI_STATS", {})
    res.json({
        bmi,
        ok: true
    })
})

router.get("/micturition", async (req, res) => {
    let now = new Date()
    now = now.valueOf() - now.valueOf() % (24 * 3600 * 1000) + 24 * 3600 * 1000
    let stats = await query("USER_MICTURITION_ENTRY_STATS", { startDate: now - (365 * 24 * 3600 * 1000), endDate: now })
    res.json({
        stats,
        ok: true
    })
})

router.get("/drinking", async (req, res) => {
    let now = new Date()
    now = now.valueOf() - now.valueOf() % (24 * 3600 * 1000) + 24 * 3600 * 1000
    let stats = await query("USER_DRINKING_ENTRY_STATS", { startDate: now - (365 * 24 * 3600 * 1000), endDate: now })
    res.json({
        stats,
        ok: true
    })
})

router.get("/nutrition", async (req, res) => {
    let now = new Date()
    now = now.valueOf() - now.valueOf() % (24 * 3600 * 1000) + 24 * 3600 * 1000
    let stats = await query("USER_NUTRITION_ENTRY_STATS", { startDate: now - (365 * 24 * 3600 * 1000), endDate: now })
    res.json({
        stats,
        ok: true
    })
})

router.get("/gender", async (req, res) => {
    let stats = await query("USER_GENDER_STATS", { role: "user" })

    res.json({
        stats,
        ok: true
    })
})

router.get("/age", async (req, res) => {
    let stats = await query("USER_AGE_STATS")

    res.json({
        stats,
        ok: true
    })
})


router.get("/photos", async (req, res) => {
    let now = new Date()
    let today = now.valueOf() - now.valueOf() % (24 * 3600 * 1000)
    now = today + 24 * 3600 * 1000
    let stats = await query("PHOTO_UPLOAD_STATS", { startDate: now - (100 * 24 * 3600 * 1000), endDate: now })
    res.json({
        stats,
        ok: true
    })
})

router.get("/ms", async (req, res) => {
    let stats = await query("MS_USER_STATS", { role: "user" } )
    
    res.json({
        stats,
        ok: true
    })
})

router.get("/incontinence", async (req, res) => {
    let stats = await query("INCONTINENCE_USER_STATS", { role: "user" } )
    
    res.json({
        stats,
        ok: true
    })
})

module.exports = router