const express = require("express")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const { v4: uuid } = require("uuid")
const PhotoLoader = require("../loaders/photos")
const ModelLoader = require("../loaders/model")

const router = express.Router()

const { query, dispatch } = require("../store")

router.get("/", (req, res) => {
    // const { start, end } = req.query
    // let start = new Date(start)
    // let end = new Date(end)

    query("PHOTO", {}, (err, photos) => {
        if(err) return res.json({ err })
        res.json({
            photos
        })
    })
})

router.get("/download", async (req, res) => {
    let photoLoader = new PhotoLoader(`/tmp/${uuid()}`, "/gpmt-photo")

    let photos = await query("PHOTOS", {})
    photoLoader.dump(photos)

    let tarPath = photoLoader.zip("/tmp")
    res.download(tarPath)
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

// upload to blob Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if(!fs.existsSync("/data/gpmt-model/photo")) {
            fs.mkdirSync("/data/gpmt-model/photo")
        }
        cb(null, "/data/gpmt-model/photo")
    },
    filename: function (req, file, cb) {
        let now = new Date()
        dispatch("CREATE_PHOTO_CLASSIFICATION_MODEL", {name: now.toISOString(), active: false}, (err, doc) => {
            console.log("CREATED PHOTO MODEL", doc._id)
            file.metadata = doc
            cb(null, doc._id.toString())
        })
    }
})

const upload = multer({ storage })
router.post("/model", upload.single("model"), (req, res) => {
    let {
        _id,
        timestamp,
        active
    } = req.file.metadata

    let modelLoader = new ModelLoader("/data/gpmt-model/photo")
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
    
        if(fs.existsSync(path.join("/data/gpmt-model/photo", id.toString()))) {
            fs.unlinkSync(path.join("/data/gpmt-model/photo", id.toString()))
        }

        await dispatch("DELETE_PHOTO_CLASSIFICATION_MODEL", { _id: id })


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

    if(!photo || !photo._id || !fs.existsSync(`/data/gpmt-photo/${photo._id}.jpeg`)) {
        return res.status(404)
    }

    res.sendFile(
        `/data/gpmt-photo/${photo._id}.jpeg`
    )
})

module.exports = router