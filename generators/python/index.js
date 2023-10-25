const Generator = require('yeoman-generator')
const { keyPair, getPythonBdkVersion }= require('../_lib/util')
const path = require('path')
const fs = require("fs")

const BOT_APP_FOLDER = 'bot-app' // source folder for bot resources
const RESOURCES_FOLDER = 'resources' // target resources folder
const PYTHON_FOLDER = 'src' // target folder containing python sources

module.exports = class extends Generator {
  async writing() {
    this.log()
    this.answers = this.options
    this.answers.bdkVersion = await getPythonBdkVersion()
    this.log(`Using BDK Version: ${this.answers.bdkVersion}`)

    this._generateRsaKeys()
    this._generateCommonFiles()
    this._generateBotSpecificFiles()
  }

  install() {
    this.spawnCommandSync('python3', [ '-m', 'venv', 'env' ])
    this.binDir = fs.existsSync(path.join(this.destinationPath(), 'env', 'bin')) ? 'bin' : 'Scripts'
    this.spawnCommandSync(path.join(this.destinationPath(), 'env', this.binDir, 'pip3'), [ 'install', '-r', 'requirements.txt' ])
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
    this.log(`You can now run your bot with: `.cyan + `env/${this.binDir}/python3 -m ${PYTHON_FOLDER}`)
  }

  _generateRsaKeys() {
    if (this.answers.host !== 'develop2.symphony.com') {
      try {
        this.log('Generating RSA keys...'.green)
        this.pair = keyPair(this.config.get('KEY_PAIR_LENGTH'))
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
