const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const path = require('path')
const axios = require('axios')
const colors = require('colors')
const fs = require('fs');
const jks = require('jks-js');

const MAVEN_SYMPHONY_SEARCH = "https://search.maven.org/solrsearch/select?q=g:com.symphony.platformsolutions+AND+a:symphony-api-client-java";
const MAVEN_SYMPHONY_CAMUNDA_SEARCH = "https://search.maven.org/solrsearch/select?q=g:com.symphony.platformsolutions+AND+a:symphony-camunda-client"
const MAVEN_SYMPHONY_OPENNLP_SEARCH = "https://search.maven.org/solrsearch/select?q=g:com.symphony.platformsolutions+AND+a:symphony-opennlp-java";

axios.get.mockImplementation((url) => {
  if (url === MAVEN_SYMPHONY_SEARCH) {
    return Promise.resolve({
      data: {
        response: {
          docs: [
            {
              latestVersion: "1.3.3"
            }
          ]
        }
      }
    })
  } else if (url === MAVEN_SYMPHONY_CAMUNDA_SEARCH) {
    return Promise.resolve({
      data: {
        response: {
          docs: [
            {
              latestVersion: "1.0.2"
            }
          ]
        }
      }
    })
  } else if (url === MAVEN_SYMPHONY_OPENNLP_SEARCH) {
    return Promise.resolve({
      data: {
        response: {
          docs: [
            {
              latestVersion: "1.0.0"
            }
          ]
        }
      }
    })
  }
})

describe("Java SDK", () => {
  const currentDir = process.cwd()

  afterAll(() => process.chdir(currentDir))

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
        checkTruststore('certificates/all_symphony_certs_truststore',
          path.join(__dirname, '../generators/common-template/truststore/all_symphony_certs.pem'));
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
        checkTruststore('certificates/all_symphony_certs_truststore',
          path.join(__dirname, '../generators/common-template/truststore/all_symphony_certs.pem'));
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
        checkTruststore('certificates/all_symphony_certs_truststore',
          path.join(__dirname, '../generators/common-template/truststore/all_symphony_certs.pem'));
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
        checkTruststore('certificates/all_symphony_certs_truststore',
          path.join(__dirname, '../generators/common-template/truststore/all_symphony_certs.pem'));
      })
  })

  function checkTruststore(truststore, pem) {
    const truststorePems = Object.values(
      jks.toPem(fs.readFileSync(truststore), 'changeit'))
      .map(key => key.ca);

    const certs = extractPems(pem);

    assert.deepStrictEqual(truststorePems.sort(), certs.sort(),
      'Truststore file is not matching the PEM file');
  }

  function extractPems(pem) {
    const pems = fs.readFileSync(pem, 'utf8')

    const certs = []
    let cert = null;
    // read file line by line to split each certificate
    pems.split('\n').forEach(line => {
      if (line === '-----BEGIN CERTIFICATE-----') {
        cert = line + '\n';
      } else if (line === '-----END CERTIFICATE-----') {
        cert += line + '\n';
        certs.push(cert)
        cert = null
      } else {
        // drop lines that are not part of a certificate
        if (cert != null) {
          cert += line + '\n';
        }
      }
    });
    return certs;
  }
})
