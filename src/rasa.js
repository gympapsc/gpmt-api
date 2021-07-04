const axios = require("axios")
const { actionStream, dispatch } = require("./store")

let client

module.exports = {
    init: baseURL => {
        // create axios client
        client = axios.create({
            baseURL: baseURL || process.env.RASA_URL,
        })
    },
    addMessage: (message) => {
        const { user, text } = message
        if(client) {
            return client.post("/webhooks/rest/webhook", {
                sender: user._id,
                message: text
            })
                .then(res => res.data)
                .then(messages => {
                    if(messages.length === 0) return null

                    if(messages.every(m => m.recipient_id == user._id)) {
                        return messages
                    }
                })
        }   
    }
}
