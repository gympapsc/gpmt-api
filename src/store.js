const bcrypt = require("bcrypt")
const {
    Message,
    User,
    Micturition,
    Drinking,
    Questionnaire,
    Answer,
    Photo,
    Stress,
    MicturitionPrediction,
    MicturitionModel,
    ClassificationModel,
    PhotoClassificationModel
} = require("./models")

const dispatch = (action, payload, ack=null) => {
    if(!ack) {
        return new Promise((res, rej) => {
            dispatch(action, payload, (err, doc) => {
                if(err) rej(err)
                res(doc)
            })
        })
    }

    switch(action) {
        case "ADD_USER_MESSAGE":
            Message.create({
                text: payload.text,
                sender: "user",
                user: payload.user
            }, ack)
            break
        case "ADD_BOT_MESSAGE":
            Message.create({
                text: payload.text,
                sender: "bot",
                user: payload.user
            }, ack)
            break
        case "ADD_MICTURITION":
            Micturition.create({
                user: payload.user,
                date: payload.date
            }, ack)
            break
        case "ADD_DRINKING":
            Drinking.create({
                amount: payload.amount,
                date: payload.date,
                user: payload.user
            }, ack)
            break
        case "ADD_USER":
            User.create({
                ...payload
            }, ack)
            break
        case "UPDATE_USER":
            User.updateOne({
                _id: payload._id
            }, {
                $set: { ...payload }
            }, ack)
            break
        case "ANSWER_QUESTION":
            Answer.create({
                user: payload.user,
                answer: payload.answer,
                question: payload.question
            }, ack)
            break
        case "CREATE_PHOTO":
            Photo.create({
                user: payload.user,
                name: payload.name
            }, ack)
            break
        case "UPDATE_PHOTO":
            Photo.updateOne({
                user: payload.user,
                _id: payload._id
            }, {
                $set: {
                    name: payload.name
                }
            }, ack)
            break
        case "DELETE_ALL_PHOTOS":
            Photo.remove({}, ack)
            break
        case "UPDATE_DRINKING":
            Drinking.updateOne({
                user: payload.user,
                _id: payload._id
            }, {
                $set: { amount: payload.amount, date: payload.date }
            }, ack)
            break
        case "UPDATE_MICTURITION":
            Micturition.updateOne({
                user: payload.user,
                _id: payload._id
            }, {
                $set: { date: payload.date }
            }, ack)
            break
        case "ADD_QUESTION":
            Questionnaire.create({
                next: [],
                condition: [],
                ...payload.question
            }, (err, doc) => {
                console.log(err)
                if(err) return ack(err, null)
                Questionnaire.updateOne({
                    _id: payload.parent_id
                }, {
                    $push: { next: doc._id }
                }, (err, parent) => {
                    ack(err, doc)
                })
            })
            break
        case "ADD_CONDITION":
            Questionnaire.updateOne({
                _id: payload._id,
            }, {
                $push: { condition: payload.condition }
            }, ack)
            break
        case "ADD_QUESTION_OPTION":
            Questionnaire.updateOne({
                _id: payload._id
            }, {
                $push: { options: payload.option }
            }, ack)
            break
        case "DELETE_QUESTION_CONDITION":
            Questionnaire.updateOne({
                _id: payload._id
            }, {
                $pull: { condition: { _id: payload.condition_id } }
            }, ack)
            break
        case "UPDATE_QUESTION":
            Questionnaire.updateOne({
                _id: payload._id
            }, {
                ...payload.question
            }, ack)
            break
        case "DELETE_QUESTION":
            function deleteNextQuestion(id) {
                Questionnaire.findOne({ _id: id }, (err, doc) => {
                    for(let n of doc.next) {
                        deleteNextQuestion(n)
                    }
                    Questionnaire.deleteOne({
                        _id: id
                    }, (err, nModified) => {
                        if(err) return ack(err, null)
                    })
                })

            }
            Questionnaire.updateMany({}, { $pullAll: { next: [payload._id] }}, ack)
            deleteNextQuestion(payload._id)
            break
        case "ADD_STRESS":
            Stress.create({
                user: payload.user,
                level: payload.level,
                date: payload.date
            }, ack)
            break
        case "UPDATE_STRESS":
            Stress.updateOne({
                _id: payload._id
            }, {
                $set: { level: payload.level, date: payload.date }
            }, ack)
            break
        case "DELETE_DRINKING":
            Drinking.deleteOne({
                _id: payload._id
            }, ack)
            break
        case "DELETE_MICTURITION":
            Micturition.deleteOne({
                _id: payload._id
            }, ack)
            break
        case "DELETE_STRESS":
            Stress.deleteOne({
                _id: payload._id
            }, ack)
            break
        case "CREATE_FORECAST_MODEL":
            MicturitionModel.create({
                ...payload
            }, ack)
            break
        case "DELETE_FORECAST_MODEL":
            MicturitionModel.deleteOne({
                _id: payload._id
            }, ack)
            break
        case "CREATE_PHOTO_CLASSIFICATION_MODEL":
            PhotoClassificationModel.create({
                ...payload
            }, ack)
            break
        case "DELETE_PHOTO_CLASSIFICATION_MODEL":
            PhotoClassificationModel.deleteOne({
                _id: payload._id
            }, ack)
            break
        case "OVERRIDE_MICTURITION_PREDICTION":
            let dates = payload.predictions.map(p => p.date)
            MicturitionPrediction.deleteMany({
                date: { $in: dates }
            }, (err, nModified) => {
                if(err) return ack(err, null)

                MicturitionPrediction.bulkWrite(
                    payload.predictions.map(p => ({
                        insertOne: {
                            document: p
                        }
                    }))
                , ack)
            })
            break
        case "ACTIVATE_FORECAST_MODEL":
            MicturitionModel.updateMany({
                active: true   
            }, {
                $set: { active: false }
            }, (err, nModified) => {
                if(err) return ack(err, null)
                MicturitionModel.updateOne({
                    _id: payload._id
                }, {
                    $set: { active: true }
                }, ack)
            })
        case "ACTIVATE_PHOTO_CLASSIFICATION_MODEL":
            PhotoClassificationModel.updateMany({
                active: true   
            }, {
                $set: { active: false }
            }, (err, nModified) => {
                if(err) return ack(err, null)
                PhotoClassificationModel.updateOne({
                    _id: payload._id
                }, {
                    $set: { active: true }
                }, ack)
            })
            break
        case "SET_UTTER_BUTTONS":
            User.updateOne({
                _id: payload.user._id
            }, {
                $set: {
                    utterButtons: payload.buttons
                }
            }, ack)
            break
        default:
            throw new Error("Unknown action " + action)
    }
}

const query = (model, selector, cb=null) => {
    if(!cb) {
        return new Promise((res, rej) => {
            query(model, selector, (err, result) => {
                if(err) rej(err)
                res(result)
            })
        })
    }

    switch(model) {
        case "MESSAGE":
            Message.find(selector, cb)
            break
        case "USER":
            User.find(
                selector
            , cb)
            break
        case "DRINKING":
            Drinking.find(selector, cb)
            break
        case "MICTURITION":
            Micturition.find(selector, cb)
            break
        case "STRESS":
            Stress.find(selector, cb)
            break
        case "QUESTIONNAIRE":
            Questionnaire.find(selector, cb)
            break 
        case "PHOTO":
            Photo.find(selector, cb)
            break
        case "ADMIN":
            User.find({
                ...selector,
                role: "admin"
            }, cb)
            break
        case "MICTURITION_PREDICTION":
            MicturitionPrediction.find({
                ...selector
            }, cb)
            break
        case "FORECAST_MODEL":
            MicturitionModel.find({
                ...selector
            }, cb)
            break
        case "PHOTO_CLASSIFICATION_MODEL":
            PhotoClassificationModel.find({
                ...selector
            }, cb)
            break
        case "ANSWER":
            Answer.find({
                ...selector
            }, cb)
            break
        case "USER_REGISTRATIONS_STATS":
            User
                .aggregate([
                    // { 
                    //     $match: { timestamp: { $gte: selector.startDate, $lte: selector.endDate } } 
                    // },
                    { 
                        $addFields:{
                            date:{
                                $dateFromParts:{
                                    year:   {$year:"$timestamp"},
                                    month:  {$month:"$timestamp"},
                                    day:    {$dayOfMonth:"$timestamp"}
                                }
                            },
                            dateRange: {
                                $map:{
                                    input: { $range: [0, {$subtract:[ selector.endDate, selector.startDate]}, 1000*60*60*24] },
                                    in: { $toDate: { $add: [ selector.startDate, "$$this" ] } }
                                }
                            }
                        }
                    },
                    {
                        $unwind:"$dateRange"
                    },
                    {
                        $group: {
                            _id:"$dateRange", 
                            registrations: {
                                $push: {
                                    $cond: [
                                        { $eq:["$dateRange","$date"] },
                                        { count: 1 },
                                        { count: 0 }
                                    ]
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            date: "$_id",
                            registrations: { $sum: "$registrations.count" }
                        }
                    }
                ])
                .exec(cb)
            break
        case "USER_SIGNINS_STATS":
            break
        case "USER_ENTRIES_STATS":
            break
        case "USER_GENDER_STATS":
            break
        case "USER_BMI_STATS":
            User
                .aggregate([
                    { 
                        $addFields:{
                            bmi: {
                                $divide: [
                                    "$weight",
                                    { 
                                        $pow: [
                                            "$height",
                                            2
                                        ] 
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id:"$bmi", 
                            users: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            bmi: "$_id",
                            users: "$users"
                        }
                    }
                ])
                .exec(cb)
            break
        default:
            throw new Error("Unknown model type " + model)
    }
}

Questionnaire.deleteMany({})
    .then(async () => {
        let q2 = await Questionnaire.create({
            type: "bool",
            name: "incontience",
            condition: [
                { type: "eq", value: "ms" },
                { type: "eq", value: "multiple sklerose" }
            ],
            next: [],
            options: []
        })

        await Questionnaire.create({
            root: true,
            type: "string",
            name: "disease",
            condition: [],
            next: [
                q2._id
            ],
            options: []
        })
    })

User.deleteMany({ role: "admin"})
    .then(() => {
        User.create({
            role: "admin",
            email: "hakim@admin.com",
            firstname: "hakim",
            surname: "rachidi",
            sex: "m",
            weight: 80,
            height: 180,
            passwordHash: bcrypt.hashSync("password", parseInt(process.env.HASH_SALT_ROUNDS)),
            birthDate: new Date(2002, 8, 12)
        })
    })

module.exports = {
    dispatch,
    query
}
