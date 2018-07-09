const Generator = require('yeoman-generator');
const colors = require('colors');
const certificateCreator = require('../lib/certificate-creator');
var mkdirp = require('mkdirp');

module.exports = class extends Generator {
  prompting() {
    return this.prompt([
      {
        type    : 'list',
        name    : 'node_bot_tpl',
        message : 'Which template do you want to start with',
        choices : ['Request/Reply', 'NLP Based Trade Order']
      }
    ]).then((answers) => {
      answers.application_name = this.options.initPrompts.application_name;
      answers.subdomain = this.options.initPrompts.subdomain;
      answers.dirname = this.options.initPrompts.dirname;
      answers.botusername = this.options.initPrompts.botusername;
      answers.botemail = this.options.initPrompts.botemail;
      answers.encryption = this.options.initPrompts.encryption;
      let log_text = ('* Generating ' +
                     this.options.initPrompts.application_type.italic +
                     ' ' +
                     this.options.initPrompts.application_lang.italic +
                     ' code from ' +
                     answers.node_bot_tpl.italic + ' template...').bold;
      console.log(log_text.bgRed.white);

      if (answers.encryption=='RSA') {
        answers.authType = 'rsa';
        answers.botCertPath = '';
        answers.botCertName = '';
        answers.botCertPassword = '';
        answers.botRSAPath = __dirname + '/rsa/';
        answers.botRSAName = 'rsa-private-' + answers.botusername + '.pem';
      } else if (answers.encryption=='Self Signed Certificate') {
        answers.authType = 'cert';
        answers.botCertPath = __dirname + '/certificates/';
        answers.botCertName = answers.botusername + '.pem';
        answers.botCertPassword = 'changeit';
        answers.botRSAPath = '';
        answers.botRSAName = '';
      } else {
        answers.authType = 'cert';
        answers.botCertPath = '';
        answers.botCertName = '';
        answers.botCertPassword = '';
        answers.botRSAPath = '';
        answers.botRSAName = '';
      }

      if (answers.node_bot_tpl=='Request/Reply') {
        this.fs.copyTpl(
          this.templatePath('node/bots/request-reply/index.js'),
          this.destinationPath('index.js'),
          answers
        );
        this.fs.copyTpl(
          this.templatePath('node/bots/request-reply/package.json'),
          this.destinationPath('package.json'),
          answers
        );
        this.fs.copyTpl(
          this.templatePath('node/bots/request-reply/config.json'),
          this.destinationPath('config.json'),
          answers
        );

      } else if (answers.node_bot_tpl=='NLP Based Trade Order') {
        this.fs.copyTpl(
          this.templatePath('node/bots/nlp-based/index.js'),
          this.destinationPath('index.js'),
          answers
        );
        this.fs.copyTpl(
          this.templatePath('node/bots/nlp-based/package.json'),
          this.destinationPath('package.json'),
          answers
        );
        this.fs.copyTpl(
          this.templatePath('node/bots/nlp-based/config.json'),
          this.destinationPath('config.json'),
          answers
        );
        this.fs.copy(
          this.templatePath('node/bots/nlp-based/README.md'),
          this.destinationPath('README.md'),
          answers
        );
        this.fs.copy(
          this.templatePath('node/bots/nlp-based/LICENSE'),
          this.destinationPath('LICENSE'),
          answers
        );

        this.fs.copy(
          this.templatePath('node/bots/nlp-based/lib'),
          this.destinationPath('lib')
        );
      }

      /* Install certificate */
      if (answers.encryption=='Self Signed Certificate') {
        let log_text_cert = ('* Generating certificate for BOT ' + answers.botusername + '...').bold;
        console.log(log_text_cert.bgRed.white);
        mkdirp.sync( 'certificates' );
        certificateCreator.create( answers.botusername, 'certificates' );
      } else if (answers.encryption=='RSA') {
        let log_text_cert = ('* Generating RSA public/private keys for BOT ' + answers.botusername + '...').bold;
        console.log(log_text_cert.bgRed.white);
        mkdirp.sync( 'rsa' );
        certificateCreator.createRSA(answers.botusername, 'rsa' );
      }

      let log_text_completion = ('* BOT generated successfully!!').bold;
      console.log(log_text_completion.bgGreen.white);

    });
  }
};
