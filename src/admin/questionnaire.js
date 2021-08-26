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
    let { insert } = req.query
    let q

    if(insert) {
        q = await dispatch("INSERT_QUESTION", { next_id: req.params.id, question })
    } else if(question.name) {
        q = await dispatch("ADD_QUESTION", { parent_id: req.params.id, question })
    } else if(question._id){
        // TODO check for infinite loop in questionnaire
        q = await dispatch("APPEND_QUESTION", { parent_id: req.params.id, _id: question._id })
    } else {
        return res.json({
            ok: false
        })
    }

    let questionnaire = await query("QUESTIONNAIRE")

    res.json({
        question: q,
        questionnaire,
        ok: true
    })
})

router.post("/:id/option", async (req, res) => {
    let { option } = req.body
    let { id } = req.params

    await dispatch("ADD_QUESTION_OPTION", { _id: id, option })

    let questions = await query("QUESTIONNAIRE", { _id: id })

    res.json({
        ok: true,
        question: questions[0]
    })
})

router.delete("/:id/option/:oid", async (req, res) => {
    let { id, oid } = req.params
    await dispatch("DELETE_QUESTION_OPTION", { _id: id, option_id: oid })
    
    res.json({
        ok: true 
    })
})

router.post("/:id/condition", async (req, res) => {
    let { condition } = req.body
    let _id = req.params.id
    await dispatch("ADD_CONDITION", { _id, condition })
    let questions = await query("QUESTIONNAIRE", { _id })

    res.json({
        ok: true,
        question: questions[0]
    })
})

router.delete("/:id/condition/:cid", async (req, res) => {
    let { id, cid } = req.params
    await dispatch("DELETE_QUESTION_CONDITION", { _id: id, condition_id: cid })

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

router.delete("/:pid/:id", async (req, res) => {
    let { id, pid } = req.params

    await dispatch("DELETE_QUESTION", { _id: id, parent_id: pid })
    let questionnaire = await query("QUESTIONNAIRE")

    res.json({
        ok: true,
        questionnaire
    })
})


module.exports = router
