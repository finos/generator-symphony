const Generator = require('yeoman-generator');
const fs = require('fs');
const keyPair = require('../_lib/rsa').keyPair;
const mkdirp = require('mkdirp');

// Make it configurable for faster test execution
const KEY_PAIR_LENGTH = 'KEY_PAIR_LENGTH';

module.exports = class extends Generator {

  async writing() {

    mkdirp.sync('symphony/workflows');
    mkdirp.sync('symphony/libs');

    try {
      this.log('Generating RSA keys...'.green.bold);
      this.pair = keyPair(this.config.get(KEY_PAIR_LENGTH) || 4096);
      this.fs.write(this.destinationPath('symphony/publickey.pem'), this.pair.public, err => this.log.error(err));
      this.fs.write(this.destinationPath('symphony/privatekey.pem'), this.pair.private, err => this.log.error(err));
      this.options.privateKeyPath = 'symphony/privatekey.pem';
    } catch (e) {
      this.log.error(`Oups, something went wrong when generating RSA key pair`, e);
    }

    this.fs.copyTpl(
      this.templatePath(`application.yaml.ejs`),
      this.destinationPath(`symphony/application.yaml`),
      this.options
    )

    this.fs.copyTpl(
      this.templatePath(`startup.sh.ejs`),
      this.destinationPath(`startup.sh`),
      this.options
    )

  }

  end() {
    if (this.pair) {
      this.log('\nYou can now update the service account '.cyan +
        `${this.options.username}`.white.bold +
        ` with the following public key on https://${this.options.host}/admin-console : `.cyan);

      this.log('\n' + this.pair.public);
    }

    this.log(`Your workflow bot has been successfully generated !`.cyan.bold);
  }
}
