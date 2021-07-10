const express = require("express")
const multer = require("multer")
const { v4: uuid } = require("uuid")
const fs = require("fs")
const path = require("path")
const { BlobServiceClient } = require("@azure/storage-blob")
const DataLoader = require("../loaders/data")

const inMemoryStorage = multer.memoryStorage()

const router = express.Router()

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.STORAGE_CONNECTION_URL)
const containerClient = blobServiceClient.getContainerClient("forecast-models")

const { query, dispatch } = require("../store")

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

const upload = multer({ storage: inMemoryStorage })

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

router.post("/model", upload.single("model"), async (req, res) => {
    let now = new Date()
    let doc = await dispatch("CREATE_FORECAST_MODEL", {
        name: now.toISOString(),
        active: false
    })

    await containerClient.createIfNotExists()

    let blobName = doc._id.toString()
    let blockBlobClient = containerClient.getBlockBlobClient(blobName)
    await blockBlobClient.upload(req.file.buffer, req.file.buffer.length)

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

    let model = await query("FORECAST_MODEL", { _id: id })

    if(!model.active) {
        await dispatch("DELETE_FORECAST_MODEL", { _id: id })

        let blobName = model._id.toString()
        let blockBlobClient = containerClient.getBlockBlobClient(blobName)
        await blockBlobClient.deleteIfExists()

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