const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const classifier = require("../classifier")
const inMemoryStorage = multer.memoryStorage()


classifier.init()

const storageAccount = require("../storage")
const { dispatch, query } = require("../store")


// TODO setup fileFilter

const upload = multer({ storage: inMemoryStorage })

const router = express.Router()

router.post("/", upload.single("photo"), async (req, res) => {  
    let doc = await dispatch("CREATE_PHOTO", {
        user: req.user,
        name: ""
    })

    let photoContainerClient = await storageAccount("photos")

    let blobName = doc._id.toString() + ".jpeg"
    await photoContainerClient.upload(blobName, req.file.buffer, req.file.buffer.length)

    let classification = await classifier.getPhotoClassification(req.user._id, doc._id.toString())

    await dispatch("UPDATE_PHOTO", {
        user: req.user,
        _id: doc._id,
        name: classification
    })

    res.json({
        photo: {
            name: classification,
            _id: doc._id.toString(),
            timestamp: doc.timestamp
        }
    })
})

router.get("/", (req, res) => {
    query("PHOTO", { user: req.user }, (err, photos) => {
        res.json({
            photos
        })
    })
})

router.get("/:start/:end", (req, res) => {
    let {start, end} = req.params
    query("PHOTO", {user: req.user, date: {$gt: new Date(start), $lte: new Date(end)}}, (err, photos) => {
        res.json({
            photos
        })
    })
})

router.get("/:id", async (req, res) => {
    console.log("GET PHOTO ID ", req.params.id)
    let photos = await query("PHOTO", {user: req.user, _id: req.params.id})

    let photoContainerClient = await storageAccount("photos")

    if(photos[0]) {
        let blobName = photos[0]._id.toString() + ".jpeg"
        let localPath = path.join("/tmp", blobName)
        if(!fs.existsSync(localPath)) {
            // load photo from blob storage
            await photoContainerClient.readToFile(blobName, localPath)
        }

        res.sendFile(
            localPath
        )
    }

    res.status(404)
})


module.exports = router
