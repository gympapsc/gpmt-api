const { query, dispatch } = require("../store")

module.exports = {
    init: jest.fn((url) => {

    }),
    send: jest.fn(async (m, u) => {

        switch(m) {
            case "ADD MICTURITION":
                break
            case "ADD HYDRATION":
                break
            case "ADD STRESS":
                break
            case "ADD NUTRITION":
                break
            case "ADD MEDICATION":
                break
            case "SIGN OUT":
                break
            default:
                break
        }
    }),
    startConversation: jest.fn(user => {

    })
}