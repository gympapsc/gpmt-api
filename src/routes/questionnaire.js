const express = require("express")
const router = express.Router()

const { dispatch, query } = require("../store")

router.post("/:id", (req, res) => {
    const _id = req.params.id

    if(_id == 0) {
        query("QUESTIONNAIRE", {}, (err, questions) => {
            if(err) return res.status(400)

            let question = questions[0]
            res.json({
                ...question
            })
        })
    } else {
        query("QUESTIONNAIRE", {_id}, (err, questions) => {
            if(err) return res.status(400)
            let question = questions[0]
    
            dispatch("ANSWER_QUESTION", { user: req.user, question, answer: req.body.answer }, (err, answer) => {
                if(err) return res.status(400)
    
                for(let q of question.next) {
                    if(!q.condition || q.condition == answer.answer) {
                        return res.json({
                            ...q.question,
                        })
                    }
                }
    
                // reached leaf of tree
            })
        })
    }
})

module.exports = router