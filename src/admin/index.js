const express = require("express")

const dataRouter = require("./data")
const questionnaireRouter = require("./questionnaire")
const photoRouter = require("./photos")
const statisticsRouter = require("./statistics")

const router = express.Router()

router.use("/data", dataRouter)
router.use("/questionnaire", questionnaireRouter)
router.use("/photo", photoRouter)
router.use("/statistics", statisticsRouter)

router.get("/", (req, res) => {
    res.json({
        admin: {}
    })
})

module.exports = router