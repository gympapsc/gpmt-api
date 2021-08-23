const tar = require("tar")
const fs = require("fs")
const path = require("path")
const { createObjectCsvWriter } = require("csv-writer")

class PhotoLoader {
    constructor(tmpDir) {
        this.tmpDir = tmpDir
    }

    dumpMetadata(photos) {
        const csvWriter = createObjectCsvWriter({
            path: path.join(this.tmpDir, "metadata") + ".csv",
            header: [
                {id: "id", title: "ID" },
                {id: "label", title: "LABEL" }
            ]
        })

        csvWriter.writeRecords(photos.map(p => ({ id: p._id, label: p.name })))
    }

    zip(out) {
        return tar.c({
            gzip: true
        }, [this.tmpDir]).pipe(
            fs.createWriteStream(
                out
            )
        )
    }
}

module.exports = PhotoLoader
