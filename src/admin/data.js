const express = require("express")
const multer = require("multer")
const { v4: uuid } = require("uuid")
const fs = require("fs")
const path = require("path")

const DataLoader = require("../loaders/data")
const router = express.Router()

const { query, dispatch } = require("../store")
const ModelLoader = require("../loaders/model")

router.get("/users", (req, res) => {
    let { start, end } = req.query
    start = new Date(start)
    end = new Date(end)
    query("USER", {}, (err, users) => {
        if(err) res.json({err})
        res.json({
            users
        })
    })
})


// TODO setup fileFilter
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if(!fs.existsSync("/data/gpmt-model/forecast")) {
            fs.mkdirSync("/data/gpmt-model/forecast")
        }
        cb(null, "/data/gpmt-model/forecast")
    },
    filename: function (req, file, cb) {
        let now = new Date()
        dispatch("CREATE_FORECAST_MODEL", {name: now.toISOString(), active: false}, (err, doc) => {
            console.log("CREATED FORECAST MODEL", doc._id)
            file.metadata = doc
            cb(null, doc._id.toString())
        })
    }
})

const upload = multer({ storage })

router.get("/download", async (req, res) => {
    let dataLoader = new DataLoader(`/tmp/${uuid()}`)

    let users = await query("USER", {})
    for(let user of users) {
        let micturition = await query("MICTURITION", { user })
        let drinking = await query("DRINKING", { user })
        let stress = await query("STRESS", { user })
        dataLoader.dump(user._id.toString(), {
            micturition,
            drinking,
            stress
        })
    }

    let tarPath = dataLoader.zip("/tmp")

    setTimeout(() => {
        fs.readdir("/tmp", (err, files) => console.log(files))
        res.download(tarPath)
    }, 4000)
})

router.get("/model", (req, res) => {
    query("FORECAST_MODEL", {}, (err, models) => {
        if(err) return res.json({ err })
        res.json({
            models
        })
    })
})

router.post("/model", upload.single("model"), (req, res) => {
    let {
        _id,
        timestamp,
        active
    } = req.file.metadata

    let modelLoader = new ModelLoader("/data/gpmt-model/forecast")

    modelLoader.load(req.file.destination, req.file.filename)

    res.json({
        model: {
            timestamp,
            active,
            _id
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

    let model = await query("FORECAST_MODEL", { _id: id })

    if(!model.active) {
        await dispatch("DELETE_FORECAST_MODEL", { _id: id })
    
        if(fs.existsSync(path.join("/data/gpmt-model/forecast", id.toString()))) {
            fs.unlinkSync(path.join("/data/gpmt-model/forecast", id.toString()))
        }

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