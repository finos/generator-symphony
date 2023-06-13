const Generator = require('yeoman-generator');
const keyPair = require('../_lib/rsa').keyPair;
const mkdirp = require('mkdirp');
const crypto = require('crypto');

// Make it configurable for faster test execution
const KEY_PAIR_LENGTH = 'KEY_PAIR_LENGTH';

module.exports = class extends Generator {

  async writing() {

    mkdirp.sync('symphony/workflows');

    if (this.options.host !== 'develop2.symphony.com') {
      try {
        this.log('Generating RSA keys...'.green.bold);
        this.pair = keyPair(this.config.get(KEY_PAIR_LENGTH) || 4096);
        this.fs.write(this.destinationPath('symphony/publickey.pem'), this.pair.public, err => this.log.error(err));
        this.fs.write(this.destinationPath('symphony/privatekey.pem'), this.pair.private, err => this.log.error(err));
      } catch (e) {
        this.log.error(`Oups, something went wrong when generating RSA key pair`, e);
      }
    }
    this.options.randomKey = crypto.randomBytes(16).toString('hex');

    this.fs.copyTpl(
      this.templatePath('application.yaml.ejs'),
      this.destinationPath('symphony/application.yaml'),
      this.options
    )
    this.fs.copy(
      this.templatePath('startup.sh'),
      this.destinationPath('startup.sh')
    )
    this.fs.copy(
      this.templatePath('hello.swadl.yaml'),
      this.destinationPath('symphony/workflows/hello.swadl.yaml')
    )
  }

  end() {
    if (this.pair) {
      this.log('\nYou can now update the service account '.cyan +
        `${this.options.username}`.white.bold +
        ` with the following public key on https://${this.options.host}/admin-console : `.cyan);

      this.log('\n' + this.pair.public);
    } else {
      this.log('\nYou can now place the private key you received in the '.yellow + 'rsa'.white + ' directory\n'.yellow);
    }

    this.log(`Your workflow bot has been successfully generated !`.cyan.bold);
  }
}
