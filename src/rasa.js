const axios = require("axios")

let client

module.exports = {
    init: baseURL => {
        // create axios client
        client = axios.create({
            baseURL: baseURL || process.env.RASA_URL,
            headers: {
                // TODO add AUTHENTICATION
            }
        }) 
    },
    addMessage: message => {
        const { user, text } = message
        if(client) {
            return client.post("/webhooks/rest/webhook", {
                sender: user._id,
                message: text
            })
        }   
    }
}
