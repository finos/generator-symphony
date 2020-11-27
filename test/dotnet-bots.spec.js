const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const path = require('path')
const colors = require('colors')

describe('.Net SDK', () => {
  const currentDir = process.cwd()

  afterAll(() => process.chdir(currentDir))

  it('Generate dotnet request-reply bot', () => {
    return helpers.run(path.join(__dirname, '../generators/dotnet-bots'))
      .inTmpDir()
      .withOptions({
        initPrompts: {
          application_type: "bot",
          application_name: 'test-bot',
          subdomain: 'acme.symphony.com',
          sessionAuthSuffix: 'acme.symphony.com',
          keyAuthSuffix: 'acme.symphony.com',
          application_lang: ".Net",
          botusername: 'megabot',
          botemail: 'botemail',
          encryption: 'RSA - Use Existing Keys'
        }
      })
      .withPrompts({
        dotnet_bot_tpl: 'Request/Reply'
      })
      .then(() => {
        assert.file(
          'certificates/all_symphony_certs_truststore'
        )
      })
  })
})
