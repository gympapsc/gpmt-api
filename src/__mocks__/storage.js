module.exports = jest.fn((name) => {
    return {
        readtoString: jest.fn(),
        readtoFile: jest.fn(),
        upload: jest.fn(),
        deleteIfExists: jest.fn(),
        list: jest.fn()
    }
})