const bcrypt = require("bcrypt")

const dispatch = jest.fn((action, payload, ack=null) => {
    if(!ack) {
        return new Promise((res, rej) => {
            dispatch(action, payload, (err, doc) => {
                if(err) return rej(err)
                res(doc)
            })
        })
    }
})

const query = jest.fn((model, selector, cb=null) => {
    if(!cb) {
        return new Promise((res, rej) => {
            query(model, selector, (err, doc) => {
                if(err) return rej(err)
                return res(doc)
            })
        })
    }

    switch(model) {
        case "MESSAGE":
            cb(null, [{
                _id: "12345",
                timestamp: new Date(2000, 0, 1).valueOf(),
                updatedAt: new Date(2000, 0, 1).valueOf(),
                text: "Hallo",
                sender: "user",
                user: "1234567890"
            }])
            break
        case "USER":
            if(selector.email === "testing@taylor.com") {
                cb(null, [{
                    _id: "1234567890",
                    timestamp: new Date(2000, 0, 1).valueOf(),
                    updatedAt: new Date(2000, 0, 1).valueOf(),
                    firstname: "Testing",
                    surname: "Taylor",
                    email: "testing@taylor.com",
                    passwordHash: bcrypt.hashSync("Password", parseInt(process.env.HASH_SALT_ROUNDS)),
                    weight: 80,
                    height: 180,
                    birthDate: new Date(2000, 0, 1),
                    sex: "m",
                    utterButtons: [],
                    settings: {
                        voiceInput: false,
                        voiceOutput: false,
                        cumulativePrediction: false
                    },
                    micturitionFrequency: 1.0
                }])
            }
            break
        case "DRINKING":
            cb(null, [{
                _id: "123",
                timestamp: new Date(2000, 0, 1).valueOf(),
                updatedAt: new Date(2000, 0, 1).valueOf(),
                user: "1234567890",
                date: new Date(2000, 0, 1).valueOf(),
                amount: 600
            }])
            break
        case "MICTURITION":
            cb(null, [{
                _id: "1234",
                timestamp: new Date(2000, 0, 1).valueOf(),
                updatedAt: new Date(2000, 0, 1).valueOf(),
                user: "1234567890",
                date: new Date(2000, 0, 1).valueOf()
            }])
            break
        case "PHOTO":
            cb(null, [{
                _id: "1234",
                timestamp: new Date(2000, 0, 1).valueOf(),
                updatedAt: new Date(2000, 0, 1).valueOf(),
                user: "1234567890",
                name: "1"
            }])
            break
        case "STRESS":
            cb(null, [{
                _id: "1234",
                timestamp: new Date(2000, 0, 1).valueOf(),
                updatedAt: new Date(2000, 0, 1).valueOf(),
                date: new Date(2000, 0, 1).valueOf(),
                user: "1234567890",
                level: 1
            }])
        default:
            cb({
                err: "Unknown model"
            }, null)
    }
})

module.exports = {
    dispatch,
    query
}