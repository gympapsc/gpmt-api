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
    getPredictions: user_id => {
        if(!client) { 
            return 
        }
        return client.get(`/micturition?user_id=${user_id}`)
            .then(res => res.data.forecast)
    }
}