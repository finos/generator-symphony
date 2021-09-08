module.exports = {
  reporters: [ "default", "jest-junit" ],
  coverageThreshold: {
    "./generators/**/*.js": {
      "lines": 90
    },
    global: {
      lines: 70,
      statements: 70
    }
  },
  coverageDirectory: "dist/coverage",
  testTimeout: 900000
}
