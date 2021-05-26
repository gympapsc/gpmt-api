const express = require("express")
const router = express.Router()

const { dispatch, query } = require("../store")

// router.post("/", (req, res) => {
//     query("QUESTIONNAIRE", {}, (err, questions) => {
//         if(err) return res.status(400)

//         console.log("QUESTION", questions[0])

//         let question = questions[0]
//         res.json({
//             ...question._doc
//         })
//     })
// })

// router.post("/:id", (req, res) => {
//     const _id = req.params.id

//     console.log("QUESTIONNAIRE REQUEST ", req.user.firstname)

//     query("QUESTIONNAIRE", {_id}, (err, questions) => {
//         if(err) return res.status(400)
//         let question = questions[0]

//         dispatch("ANSWER_QUESTION", { user: req.user, question, answer: req.body.answer }, (err, answer) => {
//             if(err) return res.status(400)

//             for(let q of question.next) {
//                 if(!q.condition || q.condition == answer.answer) {
//                     return res.json({
//                         ...q.question._doc,
//                     })
//                 }
//             }

//             // reached leaf of tree
//             dispatch("USER_SETUP_COMPLETE", {_id: req.user._id}, (err, user) => {
//                 res.json({
//                     done: true
//                 })
//             })
//         })
//     })
// })

// router.get("/answers", (req, res) => {
//     query("ANSWERS", { user: req.user }, (err, answers) => {
//         res.json({
//             answers
//         })
//     })
// })

module.exports = router