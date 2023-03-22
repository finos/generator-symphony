const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const path = require('path')
const fs = require('fs')
const {assertKeyPair} = require('./test-utils')


const SMALL_KEY_PAIR_LENGTH = 512;

describe('Workflow bot', () => {
  const currentDir = process.cwd()

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
        application: 'workflow-bot-app-docker',
      })
      .then((dir) => {
        assert.file([
          'symphony/application.yaml',
          'symphony/libs',
          'symphony/workflows',
          'symphony/privatekey.pem',
          'symphony/publickey.pem',
          'startup.sh'
        ]);
        let privateKey = fs.readFileSync('symphony/privatekey.pem', 'utf-8')
        let generatedPublicKey = fs.readFileSync('symphony/publickey.pem', 'utf-8')
        assertKeyPair(privateKey, generatedPublicKey)
      })
  })

})

