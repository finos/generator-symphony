const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const path = require('path')
const fs = require('fs')
const forge = require('node-forge')

const BASE_PYTHON = 'src'
const BASE_RESOURCE = 'resources'

const BASE_STATIC = BASE_RESOURCE + '/static'
const BASE_SCRIPTS = BASE_STATIC + '/scripts'

const SMALL_KEY_PAIR_LENGTH = 512;

describe('Python BDK', () => {
  const currentDir = process.cwd()

  afterAll(() => process.chdir(currentDir))

  it('Generate 2.0 python bot', () => {
    return helpers.run(path.join(__dirname, '../generators/bdk'))
      .inTmpDir()
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withPrompts({
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

  it('Generate 2.0 python ext-app', () => {
    const appId = 'app-id';

    return helpers.run(path.join(__dirname, '../generators/bdk'))
      .inTmpDir()
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withPrompts({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'ext-app',
        language: 'python',
        appId: appId
      }).then((dir) => {
        assertCommonFilesGenerated(dir)
        assert.file([
          path.join(BASE_PYTHON, 'ext_app_be.py'),
          path.join(BASE_STATIC, 'app.html'),
          path.join(BASE_STATIC, 'controller.html'),
          path.join(BASE_STATIC, 'css/app.css'),
          path.join(BASE_SCRIPTS, 'app.js'),
          path.join(BASE_SCRIPTS, 'controller.js'),
        ]);
        // assert scripts with correct app-id
        assertJsFileReplacedWithAppId(dir, 'app.js', appId)
        assertJsFileReplacedWithAppId(dir, 'controller.js', appId)
      })
  })
})

function assertCommonFilesGenerated(dir) {
  assert.file([
    path.join(BASE_PYTHON, '__main__.py'),
    path.join(BASE_RESOURCE, 'config.yaml'),
    path.join(BASE_RESOURCE, 'all_symphony_certs.pem'),
    path.join(BASE_RESOURCE, 'logging.conf'),
    'rsa/privatekey.pem',
    'rsa/publickey.pem',
    'requirements.txt',
    '.gitignore'
  ]);

  let privateKey = fs.readFileSync(path.join(dir, 'rsa/privatekey.pem'), 'utf-8')
  let generatedPublicKey = fs.readFileSync(path.join(dir, 'rsa/publickey.pem'), 'utf-8')
  assertKeyPair(privateKey, generatedPublicKey)

  let requirement = fs.readFileSync(path.join(dir, 'requirements.txt'), 'utf-8')
  let config = fs.readFileSync(path.join(dir, BASE_RESOURCE, 'config.yaml'), 'utf-8')
  let version_regex = /sym-api-client-python>=\d.\d+(\w\d+)?/i
  assert(requirement.match(version_regex))
  assert(config.includes('host: acme.symphony.com'))
  assert(config.includes('username: test-bot'))
  assert(config.includes('path: rsa/privatekey.pem'))
  assert(config.includes(`path: ${BASE_RESOURCE}/all_symphony_certs.pem`))
}

function assertKeyPair(generatedPrivateKey, generatedPublicKey) {
  let forgePrivateKey = forge.pki.privateKeyFromPem(generatedPrivateKey);
  let forgePublicKey = forge.pki.setRsaPublicKey(forgePrivateKey.n, forgePrivateKey.e);
  let publicKey = forge.pki.publicKeyToRSAPublicKeyPem(forgePublicKey).toString();
  assert.textEqual(generatedPublicKey.split("\n").join(""), publicKey.split("\n").join(""))
}

function assertJsFileReplacedWithAppId(dir, file, appId) {
  let appJsFile = fs.readFileSync(path.join(dir, BASE_SCRIPTS, file), 'utf-8')
  assert(appJsFile.includes(`let appId = '${appId}'`))
}
