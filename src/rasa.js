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
                .then(res => res.data)
                .then(messages => {
                    if(messages.length === 0) return ""
                    if(messages[0].recipient_id == user._id) return messages[0].text
                })
        }   
    }
}
