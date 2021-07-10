const tar = require("tar")
const fs = require("fs")
const path = require("path")
const { createObjectCsvWriter } = require("csv-writer")

class PhotoLoader {
    constructor(tmpDir, ) {
        this.tmpDir = tmpDir
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
