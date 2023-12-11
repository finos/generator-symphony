import helpers from 'yeoman-test'
import assert from 'yeoman-assert'
import path from 'path'
import fs from 'fs'
import axios from 'axios'
import { getGenerator, assertKeyPair } from './test-utils.js'
import sinon from 'sinon'

const BASE_PYTHON = 'src'
const BASE_RESOURCE = 'resources'

const BASE_STATIC = BASE_RESOURCE + '/static'
const BASE_SCRIPTS = BASE_STATIC + '/scripts'

const SMALL_KEY_PAIR_LENGTH = 512

describe('Python BDK error scenarios', () => {
  beforeEach(sinon.restore)
  afterEach(sinon.restore)

  it('Python BDK default version should be used when maven search query fails', () => {
    sinon.stub(axios, 'get').rejects({errno: -3008, code: 'ENOTFOUND'})

    return helpers.run(getGenerator())
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withAnswers({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'bot-app',
        language: 'python',
        appId: 'app-id'
      }).then((dir) => {
        assertCommonFilesGenerated(dir);
        assert.file([
          path.join(BASE_PYTHON, 'activities.py'),
          path.join(BASE_PYTHON, 'gif_activities.py'),
          path.join(BASE_RESOURCE, 'gif.jinja2')]);
      })
  })

  it('Python BDK default version should be used when maven search does not return latest version', () => {
    sinon.stub(axios, 'get').resolves(undefined)

    return helpers.run(getGenerator())
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withAnswers({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'bot-app',
        language: 'python',
        appId: 'app-id'
      }).then((dir) => {
        assertCommonFilesGenerated(dir);
        assert.file([
          path.join(BASE_PYTHON, 'activities.py'),
          path.join(BASE_PYTHON, 'gif_activities.py'),
          path.join(BASE_RESOURCE, 'gif.jinja2')]);
      })
  })
})

describe('Python BDK', () => {
  before(() =>
    sinon.stub(axios, 'get').resolves({"data": {"info": {"version": "2.3.0"}}})
  )

  after(sinon.restore)

  it('Generate 2.0 python bot', () => {
    return helpers.run(getGenerator())
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withAnswers({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'bot-app',
        language: 'python',
        appId: 'app-id'
      }).then((dir) => {
        assertCommonFilesGenerated(dir);
        assert.file([
          path.join(BASE_PYTHON, 'activities.py'),
          path.join(BASE_PYTHON, 'gif_activities.py'),
          path.join(BASE_RESOURCE, 'gif.jinja2')]);
      })
  })
})

function assertCommonFilesGenerated(dir) {
  assert.file([
    path.join(BASE_PYTHON, '__main__.py'),
    path.join(BASE_RESOURCE, 'config.yaml'),
    path.join(BASE_RESOURCE, 'logging.conf'),
    'rsa/privatekey.pem',
    'rsa/publickey.pem',
    'requirements.txt',
    '.gitignore',
    'readme.md'
  ]);

  let privateKey = fs.readFileSync('rsa/privatekey.pem', 'utf-8')
  let generatedPublicKey = fs.readFileSync('rsa/publickey.pem', 'utf-8')
  assertKeyPair(privateKey, generatedPublicKey)

  let requirement = fs.readFileSync('requirements.txt', 'utf-8')
  let config = fs.readFileSync(path.join(BASE_RESOURCE, 'config.yaml'), 'utf-8')
  let version_regex = /symphony-bdk-python>=\d.\d+(\w\d+)?/i
  assert(requirement.match(version_regex))
  assert(config.includes('host: acme.symphony.com'))
  assert(config.includes('username: test-bot'))
  assert(config.includes('path: rsa/privatekey.pem'))
}

function assertJsFileReplacedWithAppId(dir, file, appId) {
  let appJsFile = fs.readFileSync(path.join(BASE_SCRIPTS, file), 'utf-8')
  assert(appJsFile.includes(`let appId = '${appId}'`))
}
