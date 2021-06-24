const axios = require("axios")

let client = axios.create({
    baseURL: process.env.ANALYSIS_URL
})

module.exports = {
    init: baseURL => {
        // create axios client
        client = axios.create({
            baseURL: baseURL || process.env.ANALYSIS_URL
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