const express = require("express")
const multer = require("multer")
const { v4: uuid } = require("uuid")
const storageAccount = require("../storage")
const inMemoryStorage = multer.memoryStorage()

const router = express.Router()

const { query, dispatch } = require("../store")
const CsvSerializer = require("../loaders/csvSerializer")


router.delete("/", async (req, res) => {
    await dispatch("RESET")

    res.json({
        ok: true
    })
})

router.delete("/micturition", async (req, res) => {
    await dispatch("DELETE_ALL_MICTURITION")
    res.json({
        ok: true
    })
})

router.delete("/hydration", async (req, res) => {
    await dispatch("DELETE_ALL_HYDRATION")
    res.json({
        ok: true
    })
})

router.delete("/nutrition", async (req, res) => {
    await dispatch("DELETE_ALL_NUTRITION")
    res.json({
        ok: true
    })
})

router.delete("/medication", async (req, res) => {
    await dispatch("DELETE_ALL_MEDICATION")
    res.json({
        ok: true
    })
})

router.delete("/stress", async (req, res) => {
    await dispatch("DELETE_ALL_STRESS")
    res.json({
        ok: true
    })
})


router.get("/users", async (req, res) => {
    let users = await query("USER", {})
    let answers = await query("ANSWER", {})

    users = users.map(user => {
        let userAnswers = answers.filter(a => a.user._id === user._id)
        for(let answer of userAnswers) {
            user[answer.question.name] = answer.answer
        }
        return user
    })

    res.json({
        users
    })
})

router.delete("/user/:id", async (req, res) => {
    let { id: _id} = req.params
    await dispatch("DELETE_USER", { _id })
    
    res.json({
        ok: true
    })
})

// TODO setup fileFilter

const upload = multer({ storage: inMemoryStorage })

router.get("/export/csv", async (req, res) => {
    let path = `/tmp/${uuid()}`
    let csvSerializer = new CsvSerializer(path)

    let users = await query("USER", {})
    await csvSerializer.dump("users", users.map(u => ({
        id: u._id.toString(),
        timestamp: u.timestamp.toISOString(),
        brithDate: u.birthDate.toISOString(),
        weight: u.weight,
        height: u.height,
        sex: u.sex,
    })), [
        { id: "id", title: "ID"},
        { id: "timestamp", title: "TIMESTAMP" },
        { id: "weight", title: "WEIGHT" },
        { id: "height", title: "HEIGHT" },
        { id: "sex", title: "SEX" }
    ])

    let answers = await query("ANSWER", {})
    let questions = await query("QUESTIONNAIRE", {})

    await csvSerializer.dump("userInfo", answers.map(a => ({
        id: a._id.toString(),
        user: a.user,
        question: questions.find(q => q._id.toString() === a.question.toString())?.name || "NA",
        answer: a.answer
    })), [
        { id: "id", title: "ID" },
        { id: "user", title: "USER_ID" },
        { id: "question", title: "KEY" },
        { id: "answer", title: "VALUE" }
    ])

    let micturition = await query("MICTURITION", {})
    await csvSerializer.dump("micturition", micturition.map(m => ({
        id: m._id.toString(),
        date: m.date?.toISOString(),
        timestamp: m.timestamp?.toISOString(),
        user: m.user
    })), [
        { id: "id", title: "ID" },
        { id: "date", title: "DATE" },
        { id: "timestamp", title: "TIMESTAMP" },
        { id: "user", title: "USER_ID" }
    ])

    let stress = await query("STRESS", {})
    await csvSerializer.dump("stress", stress.map(s => ({
        id: s._id.toString(),
        date: s.date?.toISOString(),
        timestamp: s.timestamp?.toISOString(),
        level: s.level,
        user: s.user,
    })), [
        { id: "id", title: "ID" },
        { id: "date", title: "DATE" },
        { id: "timestamp", title: "TIMESTAMP" },
        { id: "level", title: "STRESSLEVEL" },
        { id: "user", title: "USER_ID" }
    ])

    let hydration = await query("HYDRATION", {})
    await csvSerializer.dump("hydration", hydration.map(d => ({
        id: d._id.toString(),
        date: d.date?.toISOString(),
        timestamp: d.timestamp?.toISOString(),
        amount: d.amount,
        user: d.user
    })), [
        { id: "id", title: "ID" },
        { id: "date", title: "DATE" },
        { id: "timestamp", title: "TIMESTAMP" },
        { id: "amount", title: "VOLUME" },
        { id: "user", title: "USER_ID" }
    ])

    let writeStream = csvSerializer.zip(path + ".tgz")

    writeStream.on("finish", () => {
        res.download(path + ".tgz")
    })
})

router.get("/model", (req, res) => {
    query("FORECAST_MODEL", {}, (err, models) => {
        if(err) return res.json({ err })
        res.json({
            models
        })
    })
})

router.post("/model", upload.single("model"), async (req, res) => {
    let now = new Date()
    let doc = await dispatch("CREATE_FORECAST_MODEL", {
        name: now.toISOString(),
        active: false
    })

    const forecastModelContainerClient = await storageAccount("forecast-models")

    let blobName = doc._id.toString()
    await forecastModelContainerClient.upload(blobName, req.file.buffer, req.file.buffer.length)

    res.json({
        model: {
            timestamp: doc.timestamp,
            active: doc.active,
            _id: doc._id.toString()
        }
    })
})

router.get("/model/:id", async (req, res) => {
    let { id } = req.params

    let models = await query("FORECAST_MODEL", { _id: id })
    res.json({
        model: models[0]
    }) 
})

router.post("/model/:id/activate", async (req, res) => {
    let { id } = req.params

    await dispatch("ACTIVATE_FORECAST_MODEL", { _id: id })
    res.json({
        ok: true
    })
})

router.delete("/model/:id", async (req, res) => {
    let { id } = req.params

    let models = await query("FORECAST_MODEL", { _id: id })
    let model = models[0]
    
    const forecastModelContainerClient = await storageAccount("forecast-models")

    if(!model) {
        return res
            .status(400)
            .json({
                err: "No such model"
            })
    }

    if(!model.active) {
        await dispatch("DELETE_FORECAST_MODEL", { _id: id })

        let blobName = model._id.toString()
        await forecastModelContainerClient.deleteIfExists(blobName)

        res.json({
            _id: model._id,
            ok: true
        })
    } else {
        res.json({
            err: "Model is still in use. Deactivate the model first to delete it."
        })
    }
})


module.exports = router