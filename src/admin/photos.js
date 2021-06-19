const express = require("express")
const multer = require("multer")
const { v4: uuid } = require("uuid")
const PhotoLoader = require("../loaders/photos")

const router = express.Router()

const { query, dispatch } = require("../store")

router.get("/", (req, res) => {
    const { start, end } = req.query
    start = new Date(start)
    end = new Date(end)

    query("PHOTOS", { start, end }, (err, photos) => {
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



// TODO setup fileFilter

// upload to blob Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "/data/gpmt-model/photo")
    },
    filename: function (req, file, cb) {
        // TODO get photo classification
        dispatch("CREATE_PHOTO_MODEL", {user: req.user, name: "test"}, (err, doc) => {
            console.log("CREATED PHOTO MODEL", doc._id, req.user.firstname)
            file.metadata = doc
            cb(null, doc._id + ".jpeg")
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

    let modelLoader = new ModelLoader("/gpmt-model/data")

    modelLoader.load(req.file.destination, req.file.filename)

    res.json({
        model: {
            timestamp,
            active,
            _id
        }
    })
})

module.exports = router