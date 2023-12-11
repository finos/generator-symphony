import helpers from 'yeoman-test'
import assert from 'yeoman-assert'
import fs from 'fs'
import axios from 'axios'
import { getGenerator, assertKeyPair } from './test-utils.js'
import { Readable } from 'stream'
import sinon from 'sinon'

const SMALL_KEY_PAIR_LENGTH = 512

describe('WDK error scenarios', () => {
  before(sinon.restore)
  after(sinon.restore)

  it('WDK default version should be used when maven search query fails', () => {
    sinon.stub(axios, 'get').rejects({errno: -3008, code: 'ENOTFOUND'})
    return helpers.run(getGenerator())
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withAnswers({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'workflow',
        type: 'project',
      })
      .then(() => {
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
  beforeEach(() =>
    sinon.stub(axios, 'get').resolves({"data": {"response": {"docs": [{"v": "1.6.3"}]}}})
  )

  afterEach(sinon.restore)

  it('Generate core docker bot', () => {
    return helpers.run(getGenerator())
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withAnswers({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'workflow',
        type: 'docker-core',
      })
      .then(() => {
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
    sinon.stub(global, 'fetch').resolves({ body: Readable.toWeb(Readable.from(Buffer.from('abc', 'binary'))) })

    return helpers.run(getGenerator())
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withAnswers({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'workflow',
        type: 'jar',
      })
      .then(() => {
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
    return helpers.run(getGenerator())
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withAnswers({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'workflow',
        type: 'project',
      })
      .then(() => {
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
    return helpers.run(getGenerator())
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withAnswers({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'workflow',
        type: 'docker-studio',
        appId: 'wdk-studio',
      })
      .then(() => {
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
