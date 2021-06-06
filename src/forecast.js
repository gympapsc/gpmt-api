const axios = require("axios")

let client

module.exports = {
    init: baseURL => {
        // create axios client
        client = axios.create({
            baseURL: baseURL || process.env.FORECAST_URL,
            headers: {
                // TODO add AUTHENTICATION
            }
        })
    },
    getPredictions: user_id => {
        if(!client) { 
            return 
        }
        client.get(`?user_id=${user_id}`)
            .then(data => console.log(data))
    }
}