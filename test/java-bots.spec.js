const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const path = require('path')
const axios = require('axios')
const colors = require('colors')

const MAVEN_SYMPHONY_SEARCH = "https://search.maven.org/solrsearch/select?q=g:com.symphony.platformsolutions+AND+a:symphony-api-client-java";
const MAVEN_SYMPHONY_CAMUNDA_SEARCH = "https://search.maven.org/solrsearch/select?q=g:com.symphony.platformsolutions+AND+a:symphony-camunda-client"
const MAVEN_SYMPHONY_OPENNLP_SEARCH = "https://search.maven.org/solrsearch/select?q=g:com.symphony.platformsolutions+AND+a:symphony-opennlp-java";

axios.get.mockImplementation((url) => {
  if (url === MAVEN_SYMPHONY_SEARCH) {
    return Promise.resolve({data: {
        response: {
          docs: [
            {
              latestVersion: "1.3.3"
            }
          ]
        }
      }})
  } else if (url === MAVEN_SYMPHONY_CAMUNDA_SEARCH) {
    return Promise.resolve({data: {
        response: {
          docs: [
            {
              latestVersion: "1.0.2"
            }
          ]
        }
      }})
  } else if (url === MAVEN_SYMPHONY_OPENNLP_SEARCH) {
    return Promise.resolve({data: {
        response: {
          docs: [
            {
              latestVersion: "1.0.0"
            }
          ]
        }
      }})
  }
})

it('Generate java request-reply bot', () => {
  return helpers.run(path.join(__dirname, '../generators/java-bots'))
    .inTmpDir()
    .withOptions({
      initPrompts: {
        application_type: "bot",
        application_name: 'test-bot',
        subdomain: 'acme.symphony.com',
        application_lang: "Java",
        botusername: 'megabot',
        botemail: 'botemail',
        encryption: 'RSA - Use Existing Keys'
      }
    })
    .withPrompts({
      java_bot_tpl: 'Request/Reply'
    })
    .then(() => {
      assert.file(
        'certificates/all_symphony_certs_truststore'
      )
    })
})

it('Generate java nlp bot', () => {
  return helpers.run(path.join(__dirname, '../generators/java-bots'))
    .inTmpDir()
    .withOptions({
      initPrompts: {
        application_type: "bot",
        application_name: 'test-bot',
        subdomain: 'acme.symphony.com',
        application_lang: "Java",
        botusername: 'megabot',
        botemail: 'botemail',
        encryption: 'RSA - Use Existing Keys'
      }
    })
    .withPrompts({
      java_bot_tpl: 'NLP Based Trade Workflow'
    })
    .then(() => {
      assert.file(
        'certificates/all_symphony_certs_truststore'
      )
    })
})

it('Generate java elements form bot', () => {
  return helpers.run(path.join(__dirname, '../generators/java-bots'))
    .inTmpDir()
    .withOptions({
      initPrompts: {
        application_type: "bot",
        application_name: 'test-bot',
        subdomain: 'acme.symphony.com',
        application_lang: "Java",
        botusername: 'megabot',
        botemail: 'botemail',
        encryption: 'RSA - Use Existing Keys'
      }
    })
    .withPrompts({
      java_bot_tpl: 'Elements Form'
    })
    .then(() => {
      assert.file(
        'certificates/all_symphony_certs_truststore'
      )
    })
})

it('Generate java elements form bot', () => {
  return helpers.run(path.join(__dirname, '../generators/java-bots'))
    .inTmpDir()
    .withOptions({
      initPrompts: {
        application_type: "bot",
        application_name: 'test-bot',
        subdomain: 'acme.symphony.com',
        application_lang: "Java",
        botusername: 'megabot',
        botemail: 'botemail',
        encryption: 'RSA - Use Existing Keys'
      }
    })
    .withPrompts({
      java_bot_tpl: 'ExpenseBot'
    })
    .then(() => {
      assert.file(
        'certificates/all_symphony_certs_truststore'
      )
    })
})
