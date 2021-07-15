const tar = require("tar")
const fs = require("fs")
const path = require("path")

class UserLoader {
    constructor(tmpDir) {
        this.tmpDir = tmpDir
    }

    async dump(users, answers) {
        let userData = { users: [] }
        for(let user of users) {
            let {
                _id,
                birthDate,
                weight,
                height
            } = user

            let userAnswers = answers.filter(a => a.user._id === _id)
            let data = {
                _id,
                birthDate,
                weight,
                height,
                questionnaire: {}
            }

            for(let answer of userAnswers) {
                data.questionnaire[answer.question.name] = answer.answer
            }

            userData.users.push(data)
        }
        await fs.promises.writeFile(path.join(this.tmpDir, "users.json", JSON.stringify(userData)))
    }
}

module.exports = UserLoader
