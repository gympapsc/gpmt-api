const express = require("express")
const multer = require("multer")

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

router.get("/download", (req, res) => {
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



// TODO setup fileFilter

// upload to blob Storage

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "/data/gpmt-photo-models")
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

module.exports = router