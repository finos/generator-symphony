const Generator = require('yeoman-generator');
const fs = require('fs');
const http = require('https'); // or 'https' for https:// URLs
const keyPair = require('../../lib/certificate-creator/rsa-certificate-creator').keyPair;

// Make it configurable for faster test execution
const KEY_PAIR_LENGTH = 'KEY_PAIR_LENGTH';

const WORKFLOW_BOT_JAR_URL = "https://oss.sonatype.org/content/repositories/snapshots/com/symphony/platformsolutions/workflow-bot-app/0.0.1-SNAPSHOT/workflow-bot-app-0.0.1-20210901.144751-1.jar";
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


    this.fs.copy(
      this.templatePath(`lib`),
      this.destinationPath(`lib`)
    )

    this.fs.copy(
      this.templatePath(`workflows`),
      this.destinationPath(`workflows`)
    )

    this.fs.copyTpl(
      this.templatePath(`application.yaml.ejs`),
      this.destinationPath(`application.yaml`),
      this.options
    )
  }

  download() {
    var done = this.async();

    this.log('Downloading workflow bot application...'.green.bold)
    let that = this
    const file = fs.createWriteStream(this.destinationPath('workflow-bot-app.jar'))

    http.get(WORKFLOW_BOT_JAR_URL, function (response) {
      response.pipe(file);
      file.on('finish', function () {
        that.log('Done downloading workflow bot application')
        file.close(done);
      });
    }).on('error', function (err) {
      fs.unlink(dest);
      done(err.message);
    })
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
