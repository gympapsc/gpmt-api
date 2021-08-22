const express = require("express")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const PhotoLoader = require("../loaders/photos")
const storageAccount = require("../storage")

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
    let now = new Date()
    let tmpPath = path.join("/tmp", now.valueOf())

    fs.mkdirSync(tmpPath)
    let photoModelContainerClient = await storageAccount("photo-models")

    for await (let blob of photoModelContainerClient.list()) {
        let blobPath = path.join(tmpPath, blob.name)
        await photoModelContainerClient.readToFile(blob.name, blobPath)
    }

    let photoLoader = new PhotoLoader(tmpPath)

    let photos = await query("PHOTOS", {})
    photoLoader.dump(photos)

    let tarPath = photoLoader.zip("/tmp")
    res.download(tarPath)

    // fs.unlinkSync(tarPath)
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

router.get("/:id", async (req, res) => {
    let { id } = req.params
    let photos = await query("PHOTO", {_id: id})
    let photo = photos[0]

    let photoModelContainerClient = await storageAccount("photo-models")

    if(!photo || !photo._id) {
        return res.status(404)
    }

    let blobName = photo._id.toString() + ".jpeg"
    let localPath = path.join("/tmp", blobName)
    if(!fs.existsSync(localPath)) {
        // load photo from blob storage
        await photoModelContainerClient.readToFile(blobName, localPath)
    }

    res.sendFile(
        localPath
    )

    // fs.unlinkSync(localPath)
})

router.get("/:id/download", async (req, res) => {
    let { id } = req.params
    let photos = await query("PHOTO", {_id: id})
    let photo = photos[0]

    let photoModelContainerClient = await storageAccount("photo-models")

    if(!photo || !photo._id) {
        return res.status(404)
    }

    let blobName = photo._id.toString() + ".jpeg"
    let localPath = path.join("/tmp", blobName)
    if(!fs.existsSync(localPath)) {
        // load photo from blob storage
        await photoModelContainerClient.readtoFile(blobName, localPath)
    }

    res.download(
        localPath
    )
})

module.exports = router