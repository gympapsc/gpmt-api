const tar = require("tar")
const fs = require("fs")
const path = require("path")
const { createObjectCsvWriter } = require("csv-writer")

class PhotoLoader {
    constructor(tmpDir, photoDir) {
        this.tmpDir = tmpDir
        this.photoDir = photoDir

        if (!fs.existsSync(tmpDir)){
            fs.mkdirSync(tmpDir)
        }
    }

    dump(photos) {
        const csvWriter = createObjectCsvWriter({
            path: path.join(this.tmpDir, "metadata") + ".csv",
            header: [
                {id: "id", title: "ID" },
                {id: "label", title: "LABEL" }
            ]
        })

        csvWriter.writeRecords(photos.map(p => ({ id: p._id, label: p.name })))

        fs.readdir(this.photoDir, (err, files) => {
            files.forEach(file => {
                if(path.extname(file) === ".jpeg") {
                    fs.copyFileSync(path.join(this.photoDir, file), path.join(this.tmpDir, file))
                }
            })
        })
    }

    zip(targetDir) {
        let now = new Date()
        tar.c({
            gzip: true
        }, [this.tmpDir]).pipe(
            fs.createWriteStream(
                path.join(targetDir, now.toISOString()) + ".tgz"
            )
        )

        return path.join(targetDir, now.toISOString()) + ".tgz"
    }
}

module.exports = PhotoLoader
