const Generator = require('yeoman-generator');
const keyPair = require('../../lib/certificate-creator/rsa-certificate-creator').keyPair;
const path = require('path');

const KEY_PAIR_LENGTH = 'KEY_PAIR_LENGTH';
const BDK_VERSION_DEFAULT = '2.0b2';

const COMMON_TEMPLATE_FOLDER = '../../../common-template'
const COMMON_EXT_APP_TEMPLATES = COMMON_TEMPLATE_FOLDER + '/circle-of-trust-ext-app'

const RESOURCES_FOLDER = 'resources' // target resources folder
const PYTHON_FOLDER = 'python' // target folder containing python sources


module.exports = class extends Generator {

  async writing() {
    this.answers = this.options;
    this.answers.bdkVersion = BDK_VERSION_DEFAULT;
    this.answers.trustStorePath = RESOURCES_FOLDER + '/all_symphony_certs.pem';

    this._generateRsaKeys();
    this._generateCommonFiles();

    if (this.answers.application === 'bot-app') {
      this._generateBotSpecificFiles();
    }
    if (this.answers.application === 'ext-app') {
      this._generateExtAppSpecificFiles();
    }
  }

  end() {
    if (this.pair) {
      this.log('\nYou can now update the service account '.cyan +
        `${this.answers.username}`.white.bold +
        ` with the following public key on https://${this.answers.host}/admin-console : `.cyan);

      this.log('\n' + this.pair.public);
    }

    this.log(`Your Python project has been successfully generated !`.cyan.bold);
    this.log(`Install all required packages with: `.cyan.bold + `pip3 install -r requirements.txt`);
    this.log(`And run your bot with: `.cyan.bold + `python3 -m ${PYTHON_FOLDER}.main`);
  }

  _generateRsaKeys() {
    try {
      let rsa_folder = 'rsa';
      this.log('Generating RSA keys...'.green.bold);
      this.pair = keyPair(this.config.get(KEY_PAIR_LENGTH) || 4096);
      this.fs.write(this.destinationPath(rsa_folder + '/publickey.pem'), this.pair.public, err => this.log.error(err));
      this.fs.write(this.destinationPath(rsa_folder + '/privatekey.pem'), this.pair.private, err => this.log.error(err));
      this.answers.privateKeyPath = rsa_folder + '/privatekey.pem';
    } catch (e) {
      this.log.error(`Oups, something went wrong when generating RSA key pair`, e);
    }
  }

  _generateCommonFiles() {
    [
      ['requirements.txt.ejs', 'requirements.txt'],
      ['logging.conf.ejs', 'logging.conf'],
      ['.gitignore.tpl', '.gitignore'],
      [COMMON_TEMPLATE_FOLDER + '/truststore/all_symphony_certs.pem', RESOURCES_FOLDER + '/all_symphony_certs.pem']
    ].forEach(path_pair => {
      this.fs.copyTpl(
        this.templatePath(path_pair[0]),
        this.destinationPath(path_pair[1]),
        this.answers
      )
    });
  }

  _generateBotSpecificFiles() {
    let bot_app_folder = 'bot-app';
    [
      [bot_app_folder + '/config.yaml.ejs', RESOURCES_FOLDER + '/config.yaml'],
      [bot_app_folder + '/main.py.ejs', PYTHON_FOLDER + '/main.py']
    ].forEach(path_pair => {
      this.fs.copyTpl(
        this.templatePath(path_pair[0]),
        this.destinationPath(path_pair[1]),
        this.answers
      )
    });
  }

  _generateExtAppSpecificFiles() {
    let ext_app_folder = 'ext-app';
    [
      [ext_app_folder + '/config.yaml.ejs', RESOURCES_FOLDER + '/config.yaml'],
      [ext_app_folder + '/srv.crt', RESOURCES_FOLDER + '/srv.crt'],
      [ext_app_folder + '/srv.key', RESOURCES_FOLDER + '/srv.key'],
      [ext_app_folder + '/main.py.ejs', PYTHON_FOLDER + '/main.py'],
      [ext_app_folder + '/ext_app_be.py.ejs', PYTHON_FOLDER + '/ext_app_be.py'],
      [ext_app_folder + '/config.yaml.ejs', RESOURCES_FOLDER + '/config.yaml']
    ].forEach(path_pair => {
      this.fs.copyTpl(
        this.templatePath(path_pair[0]),
        this.destinationPath(path_pair[1]),
        this.answers
      )
    });

    ['app.js', 'controller.js'].forEach(file => {
      this.fs.copyTpl(
        this.templatePath(path.join(COMMON_EXT_APP_TEMPLATES, 'scripts', file + '.ejs')),
        this.destinationPath(path.join(RESOURCES_FOLDER, 'static/scripts', file)),
        this.answers
      );
    });

    this.fs.copyTpl(
      this.templatePath(path.join(COMMON_EXT_APP_TEMPLATES, 'static')),
      this.destinationPath(RESOURCES_FOLDER + '/static'),
    );
  }
}
