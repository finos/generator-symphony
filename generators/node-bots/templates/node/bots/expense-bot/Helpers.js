const HTMLParser = require('node-html-parser')

// BEGIN: Helper to parse and clean message

const parseAndCleanMessage = (message) => {
  const dataJSON = JSON.parse(message.data)

  const parsedMessage = HTMLParser.parse(message.message)
  // Remove all identified entities
  const entities = parsedMessage.querySelectorAll('.entity')
  entities.forEach(entity => {
    const entityId = entity.attributes['data-entity-id']
    if (entityId && dataJSON[entityId]) {
      entity.set_content('')
    }
  })

  // trim whitespaces
  return parsedMessage.text.trim()
}

// END: Helper to parse and clean message

const Helpers = {
  parseAndCleanMessage
}

module.exports = Helpers
