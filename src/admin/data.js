const express = require("express")
const multer = require("multer")
const { v4: uuid } = require("uuid")
const fs = require("fs")
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

router.get("/model", (req, res) => {
    query("FORECAST_MODEL", { user: req.user }, (err, models) => {
        res.json({
            models
        })
    })
})

// TODO setup fileFilter
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // TODO check if /data/gpmt-model/forecast exists
        if(!fs.existsSync("/data/gpmt-model/forecast")) {
            fs.mkdirSync("/data/gpmt-model/forecast")
        }
        cb(null, "/data/gpmt-model/forecast")
    },
    filename: function (req, file, cb) {
        dispatch("CREATE_FORECAST_MODEL", {user: req.user, name: "test"}, (err, doc) => {
            console.log("CREATED FORECAST MODEL", doc._id, req.user.firstname)
            file.metadata = doc
            cb(null, doc._id)
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
    }, 5000)
})

router.post("/model", upload.single("model"), (req, res) => {
    let {
        _id,
        timestamp,
        active
    } = req.file.metadata

    let modelLoader = new ModelLoader("/gpmt-model/forecast")

    modelLoader.load(req.file.destination, req.file.filename)

    res.json({
        model: {
            timestamp,
            active,
            _id
        }
    })
})

router.post("/model/activate", (req, res) => {
    let { id } = req.params

    dispatch("ACTIVATE_FORECAST_MODEL", { _id: id }, (err, doc) => {
        if(err) return res.json({ err })
        res.json({
            _id: doc._id,
            timestamp: doc.timestamp,
            active: doc.active
        })
    })
})

router.delete("/model", async (req, res) => {
    let { id } = req.params
    
    await dispatch("DELETE_FORECAST_MODEL", { _id: id })
})


module.exports = router