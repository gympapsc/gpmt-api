const express = require("express")
const multer = require("multer")
const router = express.Router()

const { query, dispatch } = require("../store")

router.get("/", (req, res) => {
    const { start, end } = req.query
    start = new Date(start)
    end = new Date(end)

    query("MICTURITION", { start, end }, (err, photos) => {
        if(err) return res.json({ err })
        query("DRINKING")
        res.json({
            photos
        })
    })
})



// TODO setup fileFilter

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "/data/gpmt-forecast-models")
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