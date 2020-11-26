module.exports = {
  reporters: [ "default", "jest-junit" ],
  coverageThreshold: {
    global: {
      lines: 70,
      statements: 70
    }
  },
  coverageDirectory: "dist/coverage",
  testTimeout: 900000
}
