const express = require("express")
const axios = require("axios")

const router = express.Router()

router.get("/token", async (req, res) => {

    const tokenResponse = await axios.post(
        `https://${process.env.SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, null, 
        {
            headers: {
                "Ocp-Apim-Subscription-Key": process.env.SPEECH_TOKEN,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
    );

    res.json({
        token: tokenResponse.data,
        region: process.env.SPEECH_REGION
    })
})

module.exports = router