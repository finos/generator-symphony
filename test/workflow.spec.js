const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const path = require('path')
const fs = require('fs')
const {assertKeyPair} = require('./test-utils')
const axios = require('axios')
jest.mock('axios')
const { Readable } = require('stream')

const SMALL_KEY_PAIR_LENGTH = 512;

describe('WDK error scenarios', () => {
  axios.mockRejectedValueOnce({errno: -3008, code: 'ENOTFOUND'});

  it('WDK default version should be used when maven search query fails', () => {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inTmpDir()
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withPrompts({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'workflow',
        type: 'project',
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
    axios.mockResolvedValue({"data": {"response": {"docs": [{"v": "1.6.3"}]}}});
  })

  afterAll(() => {
    process.chdir(currentDir);
    jest.resetAllMocks();
  })

  it('Generate core docker bot', () => {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inTmpDir()
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withPrompts({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'workflow',
        type: 'docker-core',
      })
      .then((dir) => {
        assert.file([
          'symphony/application.yaml',
          'symphony/workflows/ping.swadl.yaml',
          'symphony/rsa/privatekey.pem',
          'symphony/rsa/publickey.pem',
          'startup.sh'
        ]);
        let privateKey = fs.readFileSync('symphony/rsa/privatekey.pem', 'utf-8')
        let generatedPublicKey = fs.readFileSync('symphony/rsa/publickey.pem', 'utf-8')
        assertKeyPair(privateKey, generatedPublicKey)
      })
  })

  it('Generate core JAR bot', () => {
    global.fetch = jest.fn(() => Promise.resolve({
        body: Readable.toWeb(Readable.from(Buffer.from('abc', 'binary'))),
    }));

    return helpers.run(path.join(__dirname, '../generators/app'))
      .inTmpDir()
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withPrompts({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'workflow',
        type: 'jar',
      })
      .then((dir) => {
        assert.file([
          'application.yaml',
          'workflow-bot-app.jar',
          'workflows/ping.swadl.yaml'
        ]);
        let privateKey = fs.readFileSync('rsa/privatekey.pem', 'utf-8')
        let generatedPublicKey = fs.readFileSync('rsa/publickey.pem', 'utf-8')
        assertKeyPair(privateKey, generatedPublicKey)
      })
  })

  it('Generate core project', () => {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inTmpDir()
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withPrompts({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'workflow',
        type: 'project',
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

  it('Generate studio docker bot', () => {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inTmpDir()
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withPrompts({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'workflow',
        type: 'docker-studio',
        appId: 'wdk-studio',
      })
      .then((dir) => {
        assert.file([
          'application-prod.yaml',
          'data',
          'rsa/privatekey.pem',
          'rsa/publickey.pem',
          'startup.sh'
        ]);
        let privateKey = fs.readFileSync('rsa/privatekey.pem', 'utf-8')
        let generatedPublicKey = fs.readFileSync('rsa/publickey.pem', 'utf-8')
        assertKeyPair(privateKey, generatedPublicKey)
      })
  })
})
