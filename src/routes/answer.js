const express = require("express")

const router = express.Router()


router.get("/", async (req, res) => {
    let answers = await query("ANSWER", { user: req.user })

    res.json({
        answers
    })
})


module.exports = router