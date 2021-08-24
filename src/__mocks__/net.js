module.exports = {
    init: jest.fn(() => {

    }),
    forecastMicturition: jest.fn((user) => {
        return Promise.resolve({
            forecast: [
                {
                    user: user._id,
                    prediction: 0.3,
                    date: new Date()
                }
            ]
        })
    }),
    classifyPhoto: jest.fn(() => {

    })
}