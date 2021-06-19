const tar = require("tar")
const fs = require("fs")
const path = require("path")
const { createObjectCsvWriter } = require("csv-writer")

class DataLoader {
    constructor(tmpDir) {
        this.tmpDir = tmpDir

        if (!fs.existsSync(tmpDir)){
            fs.mkdirSync(tmpDir)
        }
    }

    dump(name, {
        micturition,
        stress,
        drinking
    }) {
        let entries = [
            ...micturition.map(e => ({ date: e.date?.toISOString(), type: "MICTURITION" })),
            ...drinking.map(e => ({ date: e.date?.toISOString(), type: "DRINKING" })),
            ...stress.map(e => ({ date: e.date?.toISOString(), type: "STRESS" }))
        ]

        const csvWriter = createObjectCsvWriter({
            path: path.join(this.tmpDir, name) + ".csv",
            header: [
                {id: "date", title: "DATE" },
                {id: "type", title: "TYPE" }
            ]
        })

        csvWriter.writeRecords(entries)
    }

    zip(targetDir) {
        let now = new Date()

        let filename = now.valueOf().toString()

        tar.c({
            gzip: true
        }, [this.tmpDir]).pipe(
            fs.createWriteStream(
                path.join(targetDir, filename) + ".tgz"
            )
        )

        return path.join(targetDir, filename) + ".tgz"
    }
}

module.exports = DataLoader