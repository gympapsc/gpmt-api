const express = require("express")
const multer = require("multer")

const { dispatch, query } = require("../store")

// TODO setup fileFilter

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("photo destination for", file)
        cb(null, "/data/gpmt-photo")
    },
    filename: function (req, file, cb) {
        // TODO get photo classification
        console.log("CREATING PHOTO ", file)
        dispatch("CREATE_PHOTO", {user: req.user, name: "test"}, (err, doc) => {
            console.log("CREATED PHOTO", doc._id, req.user.firstname)
            file.metadata = doc
            cb(null, doc._id + ".jpeg")
        })
    }
})

const upload = multer({ storage })

const router = express.Router()

router.post("/", upload.single("photo"), (req, res) => {
    res.json({
        photo: {
            name: "test",
            _id: req.file.metadata._id,
            timestamp: req.file.metadata.timestamp
        }
    })
})

router.get("/", (req, res) => {
    query("PHOTO", {user: req.user}, (err, photos) => {
        res.json({
            photos
        })
    })
})

router.get("/:id", (req, res) => {
    console.log("GET PHOTO ID ", req.params.id)
    query("PHOTO", {user: req.user, _id: req.params.id}, (err, photos) => {
        if(photos[0]) {
            res.sendFile(
                `/data/gpmt-photo/${photos[0]._id}.jpeg`
            )
        }
    })
})

dispatch("DELETE_ALL_PHOTOS", {}, () => {})

module.exports = router
