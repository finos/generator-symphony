const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const path = require('path')
const fs = require('fs')
const forge = require('node-forge')

const BASE_RESOURCE = 'resources'
const BASE_PYTHON = 'python'
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
        assert.file([
          path.join(BASE_PYTHON, 'main.py'),
          path.join(BASE_RESOURCE, 'config.yaml'),
          'rsa/privatekey.pem',
          'rsa/publickey.pem',
          'requirements.txt',
          'logging.conf',
          '.gitignore'
        ]);
        let privateKey = fs.readFileSync(path.join(dir, 'rsa/privatekey.pem'), 'utf-8')
        let generatedPublicKey = fs.readFileSync(path.join(dir, 'rsa/publickey.pem'), 'utf-8')
        assertKeyPair(privateKey, generatedPublicKey)
      })
  })
})

function assertKeyPair(generatedPrivateKey, generatedPublicKey) {
  let forgePrivateKey = forge.pki.privateKeyFromPem(generatedPrivateKey);
  let forgePublicKey = forge.pki.setRsaPublicKey(forgePrivateKey.n, forgePrivateKey.e);
  let publicKey = forge.pki.publicKeyToRSAPublicKeyPem(forgePublicKey).toString();
  assert.textEqual(generatedPublicKey.split("\n").join(""), publicKey.split("\n").join(""))
}
