const Generator = require('yeoman-generator')
const colors = require('colors')
const keyPair = require('../../lib/certificate-creator/rsa-certificate-creator').keyPair

const BDK_VERSION_DEFAULT = '2.0b0'

const KEY_PAIR_LENGTH = 'KEY_PAIR_LENGTH'

module.exports = class extends Generator {

  async writing() {
    this.answers = this.options

    this.answers.bdkVersion = BDK_VERSION_DEFAULT

    try {
      this.log('Generating RSA keys...'.green.bold);
      this.pair = keyPair(this.config.get(KEY_PAIR_LENGTH) || 4096);
      this.fs.write(this.destinationPath('rsa/publickey.pem'), this.pair.public, err => this.log.error(err));
      this.fs.write(this.destinationPath('rsa/privatekey.pem'), this.pair.private, err => this.log.error(err));
      this.answers.privateKeyPath = 'rsa/privatekey.pem';
    } catch (e) {
      this.log.error(`Oups, something went wrong when generating RSA key pair`, e);
    }

    [
      ['config.yaml.ejs', 'resources/config.yaml'],
      ['requirements.txt.ejs', 'requirements.txt']
    ].forEach(path_pair => {
      this.fs.copyTpl(
        this.templatePath(path_pair[0]),
        this.destinationPath(path_pair[1]),
        this.answers
      )
    });

    [
      ['python/main.py.ejs', 'python/main.py'],
      ['logging.conf.ejs', 'logging.conf'],
      ['.gitignore.tpl', '.gitignore']
    ].forEach(path_pair => {
      this.fs.copy(
        this.templatePath(path_pair[0]),
        this.destinationPath(path_pair[1])
      )
    });

  }
}
