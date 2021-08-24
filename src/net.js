const axios = require("axios")
const FormData = require("form-data")
const { query, dispatch } = require("./store")

let client = axios.create({
    baseURL: process.env.NET_URL
})

module.exports = {
    init: baseURL => {
        client = axios.create({
            baseURL
        })
    },
    forecastMicturition: async (user) => {
        if(!client) { 
            return 
        }

        let micturition = await query("MICTURITION", { user })
        let drinking = await query("DRINKING", { user })
        let stress = await query("STRESS", { user })
        let nutrition = await query("NUTRITION", { user })
        let medication = await query("MEDICATION", { user })

        return client
            .post("/forecast/micturition", {
                user,
                micturition,
                drinking,
                stress,
                nutrition,
                medication
            })
            .then(async res => {

                await dispatch("OVERRIDE_MICTURITION_PREDICTION", { predictions: res.data.forecast })

                // forecast single day
                const start = new Date().valueOf()
                const end = start + 24 * 60 * 60 * 1000
                let forecast = await query("MICTURITION_PREDICTION", { user: user, date: { $gte: start, $lte: end } })

                return {
                    forecast
                }
            })
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