const express = require("express")
const router = express.Router()

const { dispatch, query } = require("../store")

// router.post("/", (req, res) => {
//     query("QUESTIONNAIRE", { root: true }, (err, questions) => {
//         if(err) return res.status(400)

//         console.log("QUESTION", questions[0])

//         let question = questions[0]
//         res.json({
//             ...question._doc
//         })
//     })
// })

// router.get("/tree", (req, res) => {
//     // LOAD complete tree
// })

// router.get("/:id", (req, res) => {
//     const _id = req.params.id

//     query("QUESTIONNAIRE", {_id}, (err, questions) => {
//         if(err) return res.status(400)

//         let question = questions[0]

//         dispatch("")
//     })
// })

// router.put("/:id", (req, res) => {
//     const _id = req.params.id

//     console.log("QUESTIONNAIRE REQUEST")

//     query("QUESTIONNAIRE", {_id}, (err, questions) => {
//         if(err) return res.status(400)
//         let question = questions[0]

//         dispatch("UPDATE_QUESTION", { question }, (err, answer) => {
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
//     query("ANSWERS", {}, (err, answers) => {
//         res.json({
//             answers
//         })
//     })
// })

router.get("/", (req, res) => {
    res.json({
        msg: "Only admins can see this"
    })
})

module.exports = router