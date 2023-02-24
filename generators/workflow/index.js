const Generator = require('yeoman-generator');
const fs = require('fs');
const http = require('https'); // or 'https' for https:// URLs
const keyPair = require('../_lib/rsa').keyPair;
const path = require('path');
const axios = require('axios');

// Make it configurable for faster test execution
const KEY_PAIR_LENGTH = 'KEY_PAIR_LENGTH';

const WDK_VERSION_DEFAULT = '1.4.0';

const _getVersion = () => {
  return axios.get('https://search.maven.org/solrsearch/select?q=g:org.finos.symphony.wdk')
    .then(res => res.data);
}

module.exports = class extends Generator {

  async writing() {

    this.templateSettings = {}
    this.templateSettings.wdkVersion = WDK_VERSION_DEFAULT;

    await _getVersion().then(response => {
      if (response['response']['docs'].length === 0) {
        console.log(`Failed to fetch latest Symphony WDK version from Maven Central, ${this.templateSettings.wdkVersion} will be used.`);
      } else {
        this.templateSettings.wdkVersion = response['response']['docs'][0]['latestVersion'];
      }
    }).catch(err => {
      console.log(`Failed to fetch latest Symphony WDK version from Maven Central, ${this.templateSettings.wdkVersion} will be used.`);
      console.log(`The request failed because of: {errno: ${err.errno}, code: ${err.code}}`);
    });

    if (this.options.host !== 'develop2.symphony.com') {
      try {
        this.log('Generating RSA keys...'.green.bold);
        this.pair = keyPair(this.config.get(KEY_PAIR_LENGTH) || 4096);
        this.fs.write(this.destinationPath('rsa/publickey.pem'), this.pair.public, err => this.log.error(err));
        this.fs.write(this.destinationPath('rsa/privatekey.pem'), this.pair.private, err => this.log.error(err));
      } catch (e) {
        this.log.error(`Oups, something went wrong when generating RSA key pair`, e);
      }
    }
    this.options.privateKeyPath = 'rsa/privatekey.pem';

    this._copy(["gradle", "lib", "src", "Dockerfile", "gradlew", "gradlew.bat", "README.md", "workflows"])

    this.fs.copyTpl(
      this.templatePath(`application.yaml.ejs`),
      this.destinationPath(`application.yaml`),
      this.options
    )
  }

  install() {
    this.log('Running '.green.bold + './gradlew botJar'.white.bold + ' in your project'.green.bold);
    this.spawnCommandSync(path.join(this.destinationPath(), 'gradlew'), ['botJar']);
  }

  _copy(files) {
    files.forEach(f => this.fs.copy(
        this.templatePath(f),
        this.destinationPath(f)
      )
    )

    this.fs.copyTpl(
      this.templatePath('build.gradle.ejs'),
      this.destinationPath('build.gradle'),
      this.templateSettings
    )
  }

  end() {
    if (this.pair) {
      this.log('\nYou can now update the service account '.cyan +
        `${this.options.username}`.white.bold + ` with the following public key: `.cyan);
      this.log('\n' + this.pair.public);
      this.log(`Please submit these details to your pod administrator.`.yellow);
      this.log(`If you are a pod administrator, visit https://${this.options.host}/admin-console\n`.yellow);
    } else {
      this.log('\nYou can now place the private key you received in the '.yellow + 'rsa'.white + ' directory\n'.yellow);
    }

    this.log(`Your workflow bot has been successfully generated !`.cyan.bold);
  }
}
