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
    PhotoClassificationModel,
    Nutrition,
    Medication
} = require("./models")

const collectEntryStats = collection => (start, end, cb) => {
    end = end / 1000
    start = start / 1000
    collection
        .aggregate([
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
                            input: { $range: [0, { $subtract:[ end, start] }, 60*60*24] },
                            in: { $toDate: { $multiply: [ { $add: [ start, "$$this" ] }, 1000] } }
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
                    entries: {
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
                    entries: { $sum: "$entries.count" }
                }
            }
        ])
        .exec(cb)
}

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
        case "ADD_NUTRITION":
            Nutrition.create({
                date: payload.date,
                user: payload.user,
                mass: payload.mass,
                type: payload.type
            }, ack)
            break
        case "UPDATE_NUTRITION":
            Nutrition.updateOne({
                user: payload.user,
                _id: payload._id
            }, {
                $set: { ...payload }
            }, ack)
            break
        case "DELETE_NUTRITION":
            Nutrition.deleteOne({
                _id: payload._id,
                user: payload.user
            }, ack)
            break
        case "ADD_MEDICATION":
            Medication.create({
                date: payload.date,
                user: payload.user,
                substance: payload.substance,
                mass: payload.mass
            }, ack)
            break
        case "UPDATE_MEDICATION":
            Medication.updateOne({
                user: payload.user,
                _id: payload._id
            }, {
                $set: { substance: payload.substance, mass: payload.mass, date: payload.date }
            }, ack)
            break
        case "DELETE_MEDICATION":
            Medication.deleteOne({
                _id: payload._id
            }, ack)
            break
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
                user: payload.user,
                type: payload.type
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
                $set: { amount: payload.amount, date: payload.date, type: payload.type }
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
                if(err) return ack(err, null)
                Questionnaire.updateOne({
                    _id: payload.parent_id
                }, {
                    $push: { 
                        next: {
                            _id: doc._id,
                            condition: []
                        }
                    }
                }, (err, parent) => {
                    ack(err, doc)
                })
            })
            break
        case "INSERT_QUESTION":
            Questionnaire.create({
                ...payload.question,
                next: [{ _id: payload.next_id, condition: [] }]
            }, (err, q) => {
                if (err) return ack(err, null)

                Questionnaire.updateMany({
                    "next._id": payload.next_id,
                    _id: { $ne: q._id }
                }, {
                    $set: { "next.$._id": q._id, "next.$.condition": [] }
                }, (err, op) => {
                    if (err) return ack(err, null)

                    Questionnaire.findOne({
                        _id: payload.next_id
                    }, (err, doc) => {
                        if(err) return ack(err, null)
                        if(doc && doc.root) {

                            Questionnaire.updateOne({
                                _id: doc._id
                            }, {
                                $set: { root: false}
                            }, (err, op) => {
                                if(err) return ack(err, null)
                                Questionnaire.updateOne({
                                    _id: q._id
                                }, {
                                    $set: {root: true}
                                }, (err, op) => ack(err, q))
                            })

                        } else {
                            ack(err, q)
                        }
                    })
                })
            })
            break
        case "APPEND_QUESTION":
            Questionnaire.updateOne({
                _id: payload.parent_id
            }, {
                $push: { 
                    next: {
                        _id: payload._id,
                        condition: []
                    } 
                }
            }, ack)
            break
        case "ADD_CONDITION":
            Questionnaire.updateOne({
                _id: payload._id,
                "next._id": payload.next_id
            }, {
                $push: { "next.$.condition": payload.condition }
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
                _id: payload._id,
                "next._id": payload.next_id
            }, {
                $pull: { "next.$.condition": { _id: payload.condition_id } }
            }, ack)
            break
        case "UPDATE_QUESTION":
            Questionnaire.updateOne({
                _id: payload._id
            }, {
                $set: {...payload.question }
            }, ack)
            break
        case "DELETE_QUESTION":
            Questionnaire.updateOne({
                _id: payload.parent_id,
            }, {
                $pull: { next: { _id: payload._id } }
            }, ack)
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
        case "DELETE_QUESTION_OPTION":
            Questionnaire.updateOne({
                _id: payload._id
            }, {
                $pull: { options: { _id: payload.option_id } }
            }, ack)
            break
        default:
            throw new Error("Unknown action " + action)
    }
}

const query = (model, selector={}, cb=null) => {
    if(!cb) {
        return new Promise((res, rej) => {
            query(model, selector, (err, result) => {
                if(err) rej(err)
                res(result)
            })
        })
    }

    switch(model) {
        case "MEDICATION":
            Medication.find(selector, cb)
            break
        case "NUTRITION":
            Nutrition.find(selector, cb)
            break
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
            let endDate = selector.endDate / 1000
            let startDate = selector.startDate / 1000
            User
                .aggregate([
                    { 
                        $match: { role: "user" } 
                    },
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
                                    input: { $range: [0, { $subtract:[ endDate, startDate] }, 60*60*24] },
                                    in: { $toDate: { $multiply: [ { $add: [ startDate, "$$this" ] }, 1000] } }
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
        case "USER_MICTURITION_ENTRY_STATS":
            collectEntryStats(Micturition)(selector.startDate, selector.endDate, cb)
            break
        case "USER_DRINKING_ENTRY_STATS":
            collectEntryStats(Drinking)(selector.startDate, selector.endDate, cb)
            break
        case "USER_NUTRITION_ENTRY_STATS":
            collectEntryStats(Nutrition)(selector.startDate, selector.endDate, cb)
            break
        case "USER_AGE_STATS":
            let now = new Date()
            User
                .aggregate([
                    {
                        $match: { role: "user" }
                    },
                    {
                        $project: {
                            _id: "$_id",
                            age: {
                                $round: [
                                    {
                                        $divide: [
                                            {
                                                $subtract: [
                                                    now,
                                                    "$birthDate"
                                                ]
                                            },
                                            (365 * 24 * 3600 * 1000)
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$age",
                            users: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            age: "$_id",
                            users: "$users"
                        }
                    }
                ]).exec(cb)
                break
        case "USER_GENDER_STATS":
            User
                .aggregate([
                    {
                        $match: { role: selector.role }
                    },
                    {
                        $group: {
                            _id: "$sex",
                            users: { $sum: 1 }
                        }
                    }, 
                    {
                        $project : {
                            _id: 0,
                            sex: "$_id",
                            users: "$users"
                        }
                    }
                ])
                .exec(cb)
                break
        case "USER_BMI_STATS":
            User
                .aggregate([
                    {
                        $match: {role: "user"}
                    },
                    { 
                        $addFields:{
                            bmi: {
                                $round: {
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
        case "MS_USER_STATS":
            Questionnaire.findOne({ name: "disease"}, (err, doc) => {
                Answer
                    .aggregate([
                        {
                            $match: { question: doc._id }
                        },
                        {
                            $group: {
                                _id: "$answer",
                                users: { $sum: 1 }
                            }
                        }, 
                        {
                            $project : {
                                _id: 0,
                                ms: "$_id",
                                users: "$users"
                            }
                        }
                    ])
                    .exec(cb)
            })
            break
        case "INCONTINENCE_USER_STATS":
            Questionnaire.findOne({ name: "incontinence"}, (err, doc) => {
                Answer
                    .aggregate([
                        {
                            $match: { question: doc._id }
                        },
                        {
                            $group: {
                                _id: "$answer",
                                users: { $sum: 1 }
                            }
                        }, 
                        {
                            $project : {
                                _id: 0,
                                ms: "$_id",
                                users: "$users"
                            }
                        }
                    ])
                    .exec(cb)
            })
            break
        case "PHOTO_UPLOAD_STATS":
            let start = selector.startDate / 1000
            let end = selector.endDate / 1000
            Photo
                .aggregate([
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
                                    input: { $range: [0, { $subtract:[ end, start] }, 60*60*24] },
                                    in: { $toDate: { $multiply: [ { $add: [ start, "$$this" ] }, 1000] } }
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
                            uploads: {
                                $push: {
                                    $cond: [
                                        { $eq:["$dateRange", "$date"] },
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
                            uploads: { $sum: "$uploads.count" }
                        }
                    }
                ])
                .exec(cb)
            break
        default:
            throw new Error("Unknown query type " + model)
    }
}

module.exports = {
    dispatch,
    query
}
