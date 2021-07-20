const tar = require("tar")
const fs = require("fs")
const path = require("path")
const { createObjectCsvWriter } = require("csv-writer")

class CsvSerializer {
    constructor(tmpDir) {
        this.tmpDir = tmpDir

        if (!fs.existsSync(tmpDir)){
            fs.mkdirSync(tmpDir)
        }
    }

    dump(name, rows, headers) {
        const csvWriter = createObjectCsvWriter({
            path: path.join(this.tmpDir, name) + ".csv",
            header: headers
        })

        csvWriter.writeRecords(rows)
    }

    zip(path) {
        let tarStream = tar.c({
            gzip: true
        }, [this.tmpDir]).pipe(
            fs.createWriteStream(
                path
            )
        )
        return tarStream
    }
}

module.exports = CsvSerializer