const HTMLParser = require('node-html-parser')

// BEGIN: Helper to parse message

const parseMessage = (message) => {
  const parsedMessage = HTMLParser.parse(message.message)
  return parsedMessage.text
}

// END: Helper to parse message

// BEGIN: Helper to parse and clean message

const parseAndCleanMessage = (message) => {
  let parsedMessage = parseMessage(message)

  // removing mentions
  parsedMessage = parsedMessage.replace(/\B@[a-z0-9_-]+/gi, '')

  // removing hashtags
  parsedMessage = parsedMessage.replace(/\B#[a-z0-9_-]+/gi, '')

  // removing cashtags
  parsedMessage = parsedMessage.replace(/\B\$[a-z0-9_-]+/gi, '')

  // trim whitespaces
  parsedMessage = parsedMessage.trim()

  return parsedMessage
}

// END: Helper to parse and clean message

const Helpers = {
  parseMessage,
  parseAndCleanMessage,
}

module.exports = Helpers
