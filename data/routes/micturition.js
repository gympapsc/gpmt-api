const express = require("express")
const { dispatch } = require("../store.js")
const router = express.Router()

router.get("/:id", (req, res) => {
    const { id } = req.param
    Micturition
        .findById({ _id: id })
        .then(doc => {
            res.json(doc)
        })
})

router.post("/", (req, res) => {
    dispatch("CREATE_MICTURITION", req.body, (err, micturition) => {
        if (err) return res.status(400).json({ err })
        res.json(micturition)
    })
})

router.put("/:id", (req, res) => {
    Micturition.updateOne({ _id: res.params.id }, (err, micturition) => {
        if(err) return res.status(400).json({ err })
        res.json(micturition)
    })
})

router.delete("/:id", (req, res) => {
    Micturition.deleteOne({ _id: res.params.id }, (err) => {
        if(err) return res.status(400)
        res.json({ status: 200 })
    })
})

module.exports = router
