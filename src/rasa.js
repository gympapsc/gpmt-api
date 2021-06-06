const axios = require("axios")
const { actionStream, dispatch } = require("./store")

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
    addMessage: (message, onMessage) => {
        const { user, text } = message
        if(client) {
            client.post("/webhooks/rest/webhook", {
                sender: user._id,
                message: text
            })
                .then(res => res.data)
                .then(messages => {
                    if(messages.length === 0) return null

                    if(messages.every(m => m.recipient_id == user._id)) {
                        messages.forEach(onMessage)
                    }
                })
        }   
    }
}
