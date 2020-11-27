module.exports = {
  reporters: [ "default", "jest-junit" ],
  coverageThreshold: {
    "./generators/bdk/**/*.js": {
      "lines": 90,
      "statements": 90
    },
    global: {
      lines: 70,
      statements: 70
    }
  },
  coverageDirectory: "dist/coverage",
  testTimeout: 900000
}
