const fs = require("fs")
const path = require("path")

class ModelLoader {
    constructor(modelDir) {
        this.modelDir = modelDir

        if (!fs.existsSync(tmpDir)){
            fs.mkdirSync(tmpDir)
        }
    }

    load(modelpath, name) {
        fs.copyFileSync(path.join(modelpath, name), path.join(this.modelDir, name))
    }
}

module.exports = ModelLoader