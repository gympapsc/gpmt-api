const express = require("express")

const dataRouter = require("./data")
const questionnaireRouter = require("./questionnaire")
const photoRouter = require("./photos")

const router = express.Router()

router.use("/data", dataRouter)
router.use("/questionnaire", questionnaireRouter)
router.use("/photo", photoRouter)

router.get("/", (req, res) => {
    res.json({
        admin: {}
    })
})

module.exports = router