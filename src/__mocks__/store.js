const dispatch = jest.fn((action, payload, ack) => ack({}))
const query = jest.fn((model, selector, cb) => cb(null, {}))

module.exports = {
    dispatch,
    query
}