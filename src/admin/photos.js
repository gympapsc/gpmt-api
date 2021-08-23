const express = require("express")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const PhotoLoader = require("../loaders/photos")
const storageAccount = require("../storage")
const { v4: uuid } = require("uuid")


const inMemoryStorage = multer.memoryStorage()
const router = express.Router()

const { query, dispatch } = require("../store")

router.get("/", (req, res) => {
    // const { start, end } = req.query
    // let start = new Date(start)
    // let end = new Date(end)

    // let { label } = req.query

    // if(!label) {
    query("PHOTO", {}, (err, photos) => {
        if(err) return res.json({ err })
        res.json({
            photos
        })
    })
    // } else {
    //     query("PHOTO", { $text: { $search: label } }, (err, photos) => {
    //         if(err) return res.json({ err })
    //         res.json({
    //             label,
    //             photos
    //         })
    //     })
    // }
})

router.get("/download", async (req, res) => {
    // load all photos from blob storage into /tmp 
    let dir = `/tmp/${uuid()}`

    fs.mkdirSync(dir)
    let photoContainerClient = await storageAccount("photos")

    for await (let blob of photoContainerClient.list()) {
        let blobPath = path.join(dir, blob.name)
        await photoContainerClient.readToFile(blob.name, blobPath)
    }

    let photoLoader = new PhotoLoader(dir)

    let photos = await query("PHOTO", {})
    photoLoader.dumpMetadata(photos)

    let writeStream = photoLoader.zip(dir + ".tgz")

    writeStream.on("finish", () => {
        res.download(dir + ".tgz")
    })
})

router.get("/model", async (req, res) => {
    try {
        let models = await query("PHOTO_CLASSIFICATION_MODEL", {})

        res.json({
            models,
            err: false
        })
    } catch {
        res.json({
            err: "Error"
        })
    }
})

// TODO setup fileFilter
const upload = multer({ storage: inMemoryStorage })

router.post("/model", upload.single("model"), async (req, res) => {
    let now = new Date()
    let doc = await dispatch("CREATE_PHOTO_CLASSIFICATION_MODEL", {
        name: now.toISOString(),
        active: false
    })

    let photoModelContainerClient = await storageAccount("photo-models")

    let blobName = doc._id.toString()
    await photoModelContainerClient.upload(blobName, req.file.buffer, req.file.buffer.length)
    
    res.json({
        model: {
            timestamp: doc.timestamp,
            active: doc.active,
            _id: doc._id
        }
    })
})

router.get("/model/:id", async (req, res) => {
    let { id } = req.params

    let models = await query("PHOTO_CLASSIFICATION_MODEL", { _id: id })
    res.json({
        model: models[0]
    }) 
})

router.post("/model/:id/activate", async (req, res) => {
    let { id } = req.params

    await dispatch("ACTIVATE_PHOTO_CLASSIFICATION_MODEL", { _id: id })

    res.json({
        _id: id,
        ok: true
    })
})

router.delete("/model/:id", async (req, res) => {
    let { id } = req.params
    if(!id) {
        return res
            .status(401)
            .json({
                err: "`id` parameter missing"
            })
    }

    let models = await query("PHOTO_CLASSIFICATION_MODEL", { _id: id })
    let model = models[0]

    let photoModelContainerClient = await storageAccount("photo-models")
    if(!model) {
        return res
            .status(400)
            .json({
                err: "No model found"
            })
    }

    if(!model.active) {
        await dispatch("DELETE_PHOTO_CLASSIFICATION_MODEL", { _id: id })

        let blobName = model._id.toString()
        await photoModelContainerClient.deleteIfExists(blobName)

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