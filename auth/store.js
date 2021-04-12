const {
    User
} = require("./models")

const dispatch = (type, payload, ack) => {
    switch(type) {
        case "CREATE_USER":
            User.create(payload, ack)
    }
}


const query = (model, selector, cb) => {
    switch(model) {
        case "USER":
            User.findOne(selector, cb)
    }
}

module.exports = {
    dispatch,
    query
}
