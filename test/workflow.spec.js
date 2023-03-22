const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const path = require('path')
const fs = require('fs')
const {assertKeyPair} = require('./test-utils')
const axios = require("axios");
jest.mock('axios');


const SMALL_KEY_PAIR_LENGTH = 512;

describe('WDK error scenarios', () => {
  axios.get.mockRejectedValueOnce({errno: -3008, code: 'ENOTFOUND'});

  it('WDK default version should be used when maven search query fails', () => {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inTmpDir()
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withPrompts({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'workflow-bot-app',
      })
      .then((dir) => {
        assert.file([
          'application.yaml',
          'workflow-bot-app.jar',
          'lib',
          'workflows/ping.swadl.yaml',
          'README.md'
        ]);
        let privateKey = fs.readFileSync('rsa/privatekey.pem', 'utf-8')
        let generatedPublicKey = fs.readFileSync('rsa/publickey.pem', 'utf-8')
        assertKeyPair(privateKey, generatedPublicKey)
      })
  })

  it('WDK default version should be used when maven search does not return latest version', () => {
    axios.get.mockResolvedValue({"data": {"response": {"docs": []}}});

    return helpers.run(path.join(__dirname, '../generators/app'))
      .inTmpDir()
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withPrompts({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'workflow-bot-app',
      })
      .then((dir) => {
        assert.file([
          'application.yaml',
          'workflow-bot-app.jar',
          'lib',
          'workflows/ping.swadl.yaml',
          'README.md'
        ]);
        let privateKey = fs.readFileSync('rsa/privatekey.pem', 'utf-8')
        let generatedPublicKey = fs.readFileSync('rsa/publickey.pem', 'utf-8')
        assertKeyPair(privateKey, generatedPublicKey)
      })
  })
})

describe('Workflow bot', () => {
  const currentDir = process.cwd()

  beforeAll(() => {
    axios.get.mockResolvedValue({"data": {"response": {"docs": [{"latestVersion": "0.0.6-SNAPSHOT"}]}}});
  })

  afterAll(() => {
    process.chdir(currentDir);
    jest.resetAllMocks();
  })

  it('Generate workflow bot', () => {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inTmpDir()
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withPrompts({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'workflow-bot-app',
      })
      .then((dir) => {
        assert.file([
          'application.yaml',
          'workflow-bot-app.jar',
          'lib',
          'workflows/ping.swadl.yaml',
          'README.md'
        ]);
        let privateKey = fs.readFileSync('rsa/privatekey.pem', 'utf-8')
        let generatedPublicKey = fs.readFileSync('rsa/publickey.pem', 'utf-8')
        assertKeyPair(privateKey, generatedPublicKey)
      })
  })

})

