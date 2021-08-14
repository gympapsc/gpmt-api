const path = require("path")

module.exports = {
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: path.resolve(__dirname, 'coverage'),
  testPathIgnorePatterns: [
    'e2e'
  ]
}
