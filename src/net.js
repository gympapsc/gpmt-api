const axios = require("axios")
const FormData = require("form-data");

let client = axios.create({
    baseURL: process.env.ANALYSIS_URL
})

module.exports = {
    init: baseURL => {
        client = axios.create({
            baseURL
        })
    },
    forecastMicturition: (user, micturition, drinking, stress, nutrition, medication) => {
        if(!client) { 
            return 
        }
        return client
            .post("/forecast/micturition", {
                user,
                micturition,
                drinking,
                stress,
                nutrition,
                medication
            })
            .then(res => ({
                forecast: res.data.forecast,
                // micturitionFrequency: res.data.micturitionFrequency
            }))
    },
    classifyPhoto: (user_id, photo_id, photoBuffer) => {
        if(!client) { 
            return 
        }

        let formData = new FormData()
        formData.append("photo", photoBuffer)

        return client
            .post("/photo/classification", formData, {
                headers: formData.getHeaders()
            })
            .then(res => res.data.classification)
            
    }
}