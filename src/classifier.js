const axios = require("axios")

let client

module.exports = {
    init: baseURL => {
        // create axios client
        client = axios.create({
            baseURL: baseURL || process.env.CLASSIFIER_URL,
            headers: {
                // TODO add AUTHENTICATION
            }
        })
    },
    getPhotoClassification: user_id => {
        if(!client) { 
            return 
        }
        client.get(`?user_id=${user_id}`)
            .then(data => data.classification)
            
    }
}