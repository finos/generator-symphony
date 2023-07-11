const Generator = require('yeoman-generator')
const keyPair = require('../_lib/rsa').keyPair
const path = require('path')
const axios = require("axios")

const KEY_PAIR_LENGTH = 'KEY_PAIR_LENGTH'
const BDK_VERSION_DEFAULT = '2.6.1'

const COMMON_EXT_APP_TEMPLATES = '../../_common/circle-of-trust-ext-app'

const BOT_APP_FOLDER = 'bot-app' // source folder for bot resources
const EXT_APP_FOLDER = 'ext-app' // source folder for ext app resources
const RESOURCES_FOLDER = 'resources' // target resources folder
const PYTHON_FOLDER = 'src' // target folder containing python sources

const _getVersion = () => {
  return axios('https://pypi.org/pypi/symphony-bdk-python/json', { timeout: 5000 })
    .then(res =>  res.data)
}

module.exports = class extends Generator {
  async writing() {
    this.log()
    this.answers = this.options
    this.answers.bdkVersion = BDK_VERSION_DEFAULT

    await _getVersion().then(response => {
      if (response === undefined) {
        console.log(`Failed to fetch latest Python BDK version from Pypi, ${this.answers.bdkVersion} will be used.`)
      } else {
        this.answers.bdkVersion = response['info']['version']
      }
    }).catch(err => {
      console.log(`Failed to fetch latest Python BDK version from Pypi, ${this.answers.bdkVersion} will be used.`)
      console.log(`The request failed because of: {errno: ${err.errno}, code: ${err.code}}`)
    })
    this.log(`BDK Version: ${this.answers.bdkVersion}`)

    this._generateRsaKeys()
    this._generateCommonFiles()

    if (this.answers.application === 'bot-app') {
      this._generateBotSpecificFiles()
    } else if (this.answers.application === 'ext-app') {
      this._generateExtAppSpecificFiles()
    }

  }

  install() {
    this.spawnCommandSync('python3', [ '-m', 'venv', 'env' ])
    this.spawnCommandSync(path.join(this.destinationPath(), 'env', 'bin', 'pip3'), [ 'install', '-r', 'requirements.txt' ])
  }

  end() {
    if (this.pair) {
      this.log('\nYou can now update the service account '.cyan +
        `${this.answers.username}`.white + ` with the following public key: `.cyan)
      this.log('\n' + this.pair.public)
      this.log(`Please submit these details to your pod administrator.`.yellow)
      this.log(`If you are a pod administrator, visit https://${this.answers.host}/admin-console\n`.yellow)
    } else {
      this.log('\nYou can now place the private key you received in the '.yellow + 'rsa'.white + ' directory\n'.yellow)
    }

    this.log(`Your Python project has been successfully generated !`.cyan)
    this.log(`A virtual environment has been created in:`.cyan + ' ./env')
    this.log(`You can now run your bot with: `.cyan + `env/bin/python3 -m ${PYTHON_FOLDER}`)
  }

  _generateRsaKeys() {
    if (this.answers.host !== 'develop2.symphony.com') {
      try {
        this.log('Generating RSA keys...'.green)
        this.pair = keyPair(this.config.get(KEY_PAIR_LENGTH) || 4096)
        this.fs.write(this.destinationPath('rsa/publickey.pem'), this.pair.public, err => this.log.error(err))
        this.fs.write(this.destinationPath('rsa/privatekey.pem'), this.pair.private, err => this.log.error(err))
      } catch (e) {
        this.log.error(`Oups, something went wrong when generating RSA key pair`, e)
      }
    }
    this.answers.privateKeyPath = 'rsa/privatekey.pem'
  }

  _generateCommonFiles() {
    this._copy('readme.md')
    this._copy('.gitignore.tpl', `.gitignore`)
    this._copy('logging.conf', path.join(RESOURCES_FOLDER, 'logging.conf'))
    this._copyTpl('requirements.txt')
  }

  _generateBotSpecificFiles() {
    [ 'activities.py', '__main__.py', 'gif_activities.py' ]
      .forEach(f => this._copy(path.join(BOT_APP_FOLDER, f), path.join(PYTHON_FOLDER, f)))

    this._copy(path.join(BOT_APP_FOLDER, 'gif.jinja2'), path.join(RESOURCES_FOLDER, 'gif.jinja2'))
    this._copyTpl(path.join(BOT_APP_FOLDER, 'config.yaml'), path.join(RESOURCES_FOLDER, 'config.yaml'))
  }

  _generateExtAppSpecificFiles() {
    [ '__main__.py', 'ext_app_be.py' ]
      .forEach(f => this._copy(path.join(EXT_APP_FOLDER, f), path.join(PYTHON_FOLDER, f)));

    [ 'srv.crt', 'srv.key' ]
      .forEach(f => this._copy(path.join(EXT_APP_FOLDER, f), path.join(RESOURCES_FOLDER, f)));

    this._copyTpl(path.join(EXT_APP_FOLDER, 'config.yaml'), path.join(RESOURCES_FOLDER, 'config.yaml'));

    [ 'app.js', 'controller.js' ].forEach(f => this._copyTpl(
      path.join(COMMON_EXT_APP_TEMPLATES, 'scripts', f),
      path.join(RESOURCES_FOLDER, 'static', 'scripts', f)
    ));
    this._copy(path.join(COMMON_EXT_APP_TEMPLATES, 'static'), path.join(RESOURCES_FOLDER, 'static'))
  }

  _copyTpl(fileName, destFileName) {
    this.fs.copyTpl(
      this.templatePath(`${fileName}.ejs`),
      this.destinationPath(destFileName || fileName),
      this.answers
    )
  }

  _copy(fileName, destFileName) {
    this.fs.copy(
      this.templatePath(fileName),
      this.destinationPath(destFileName || fileName)
    )
  }
}
