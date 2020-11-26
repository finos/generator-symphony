const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const path = require('path')
const colors = require('colors')

it('Generate python request-reply bot', () => {
  return helpers.run(path.join(__dirname, '../generators/python-bots'))
    .inTmpDir()
    .withOptions({
      initPrompts: {
        application_type: "bot",
        application_name: 'test-bot',
        subdomain: 'acme.symphony.com',
        sessionAuthSuffix: 'acme.symphony.com',
        keyAuthSuffix: 'acme.symphony.com',
        application_lang: "Python",
        botusername: 'megabot',
        botemail: 'botemail',
        encryption: 'RSA - Use Existing Keys'
      }
    })
    .withPrompts({
      pythonBotTemplate: 'Request/Reply'
    })
    .then(() => {
      assert.file(
        'certificates/all_symphony_certs.pem'
      )
    })
})

it('Generate python request-reply bot', () => {
  return helpers.run(path.join(__dirname, '../generators/python-bots'))
    .inTmpDir()
    .withOptions({
      initPrompts: {
        application_type: "bot",
        application_name: 'test-bot',
        subdomain: 'acme.symphony.com',
        sessionAuthSuffix: 'acme.symphony.com',
        keyAuthSuffix: 'acme.symphony.com',
        application_lang: "Python",
        botusername: 'megabot',
        botemail: 'botemail',
        encryption: 'RSA - Use Existing Keys'
      }
    })
    .withPrompts({
      pythonBotTemplate: 'Elements Form'
    })
    .then(() => {
      assert.file(
        'certificates/all_symphony_certs.pem'
      )
    })
})
