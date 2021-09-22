const Generator = require('yeoman-generator');
const fs = require('fs');
const http = require('https'); // or 'https' for https:// URLs
const keyPair = require('../_lib/rsa').keyPair;
const path = require('path');

// Make it configurable for faster test execution
const KEY_PAIR_LENGTH = 'KEY_PAIR_LENGTH';

module.exports = class extends Generator {

  async writing() {
    try {
      this.log('Generating RSA keys...'.green.bold);
      this.pair = keyPair(this.config.get(KEY_PAIR_LENGTH) || 4096);
      this.fs.write(this.destinationPath('rsa/publickey.pem'), this.pair.public, err => this.log.error(err));
      this.fs.write(this.destinationPath('rsa/privatekey.pem'), this.pair.private, err => this.log.error(err));
      this.options.privateKeyPath = 'rsa/privatekey.pem';
    } catch (e) {
      this.log.error(`Oups, something went wrong when generating RSA key pair`, e);
    }

    this._copy(["gradle", "lib", "src", "build.gradle", "Dockerfile", "gradlew", "gradlew.bat", "README.md", "workflows"])

    this.fs.copyTpl(
      this.templatePath(`application.yaml.ejs`),
      this.destinationPath(`application.yaml`),
      this.options
    )
  }

  install() {
      this.log('Running '.green.bold + './gradlew botJar'.white.bold + ' in your project'.green.bold);
      let buildResult = this.spawnCommandSync(path.join(this.destinationPath(), 'gradlew'), ['botJar']);
      if (buildResult.status !== 0) {
          this.log.error(buildResult.stderr);
      }
  }

  _copy(files) {
    files.forEach(f => this.fs.copy(
        this.templatePath(f),
        this.destinationPath(f)
      )
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
