const express = require("express")
const router = express.Router()

const { dispatch, query } = require("../store")


router.get("/", async (req, res) => {
    let questionnaire = await query("QUESTIONNAIRE", {})

    res.json({
        questionnaire
    })
})


router.post("/:id", async (req, res) => {
    let { question } = req.body
    let parent_id = req.params.id
    let q = await dispatch("ADD_QUESTION", { parent_id, question })

    res.json({
        question: q,
        ok: true
    })
})


router.post("/:id/condition", async (req, res) => {
    let { condition } = req.body
    let _id = req.params.id
    let q = await dispatch("ADD_CONDITION", { _id, condition })

    res.json({
        ok: true
    })
})


router.put("/:id", async (req, res) => {
    let { id } = req.params
    let { question } = req.body
    let q = await dispatch("UPDATE_QUESTION", { _id: id, question})

    res.json({
        ok: true
    })
})

router.delete("/:id", async (req, res) => {
    let { id } = req.params
    let q = await dispatch("DELETE_QUESTION", { _id: id })

    res.json({
        ok: true
    })
})


module.exports = router
