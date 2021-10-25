const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const path = require('path')
const fs = require('fs')
const {assertKeyPair} = require('./test-utils')
const axios = require("axios");
jest.mock('axios');


const SMALL_KEY_PAIR_LENGTH = 512;

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
          'README.md',
          'Dockerfile'
        ]);
        let privateKey = fs.readFileSync('rsa/privatekey.pem', 'utf-8')
        let generatedPublicKey = fs.readFileSync('rsa/publickey.pem', 'utf-8')
        assertKeyPair(privateKey, generatedPublicKey)
      })
  })

})

