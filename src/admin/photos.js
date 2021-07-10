const express = require("express")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const { v4: uuid } = require("uuid")
const PhotoLoader = require("../loaders/photos")
const ModelLoader = require("../loaders/model")
const { BlobServiceClient } = require("@azure/storage-blob")

const inMemoryStorage = multer.memoryStorage()

const router = express.Router()

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.STORAGE_CONNECTION_URL)
const containerClient = blobServiceClient.getContainerClient("photo-models")

const { query, dispatch } = require("../store")

router.get("/", (req, res) => {
    // const { start, end } = req.query
    // let start = new Date(start)
    // let end = new Date(end)

    let { label } = req.query

    if(!label) {
        query("PHOTO", {}, (err, photos) => {
            if(err) return res.json({ err })
            res.json({
                photos
            })
        })
    } else {
        query("PHOTO", { $text: { $search: label } }, (err, photos) => {
            if(err) return res.json({ err })
            res.json({
                label,
                photos
            })
        })
    }
})

router.get("/download", async (req, res) => {
    // load all photos from blob storage into /tmp 
    let now = new Date()
    let tmpPath = path.join("/tmp", now.valueOf())

    fs.mkdirSync(tmpPath)    
    for await (let blob of containerClient.listBlobsFlat()) {
        let blobPath = path.join(tmpPath, blob.name)
        let blockClient = containerClient.getBlockBlobClient(blob.name)
        blockClient.downloadToFile(blobPath)
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

    await containerClient.createIfNotExists()

    let blobName = doc._id.toString()
    let blockBlobClient = containerClient.getBlockBlobClient(blobName)
    await blockBlobClient.upload(req.file.buffer, req.file.buffer.length)
    
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

    let model = await query("PHOTO_CLASSIFICATION_MODEL", { _id: id })

    if(!model.active) {
        await dispatch("DELETE_PHOTO_CLASSIFICATION_MODEL", { _id: id })

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

router.get("/:id", async (req, res) => {
    let { id } = req.params
    let photos = await query("PHOTO", {_id: id})
    let photo = photos[0]

    if(!photo || !photo._id) {
        return res.status(404)
    }

    let blobName = photo._id.toString() + ".jpeg"
    let localPath = path.join("/tmp", blobName)
    if(!fs.existsSync(localPath)) {
        // load photo from blob storage
        let blockBlobClient = containerClient.getBlockBlobClient(blobName)
        await blockBlobClient.downloadToFile(localPath)
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

    if(!photo || !photo._id) {
        return res.status(404)
    }

    let blobName = photo._id.toString() + ".jpeg"
    let localPath = path.join("/tmp", blobName)
    if(!fs.existsSync(localPath)) {
        // load photo from blob storage
        let blockBlobClient = containerClient.getBlockBlobClient(blobName)
        await blockBlobClient.downloadToFile(localPath)
    }

    res.download(
        localPath
    )
})

module.exports = router