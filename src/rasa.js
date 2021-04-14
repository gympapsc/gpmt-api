const axios = require("axios")

module.exports = {
    init: () => {
        // create axios client
    },
    addMessage: message => {
        const { user, text } = message
        // get user id and send text to rasa rest api
    }
}
