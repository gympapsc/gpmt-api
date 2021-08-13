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
            .then(res => ({
                forecast: res.data.forecast,
                micturitionFrequency: res.data.micturitionFrequency
            }))
    },
    getDrinkingStats: user_id => {
        return client.get(`/drinking?user_id=${user_id}`)
            .then(res => ({
                avgAmount: res.data.avgAmount
            }))
    }
}