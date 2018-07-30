const Generator = require('yeoman-generator');
const colors = require('colors');
const certificateCreator = require('../lib/p12-certificate-creator');
var mkdirp = require('mkdirp');

module.exports = class extends Generator {
  prompting() {
    return this.prompt([
      {
        type    : 'list',
        name    : 'python_bot_tpl',
        message : 'Which template do you want to start with',
        choices : ['Request/Reply', 'NLP Based Trade Workflow']
      }
    ]).then((answers) => {
      answers.application_name = this.options.initPrompts.application_name;
      answers.subdomain = this.options.initPrompts.subdomain;
      answers.dirname = this.options.initPrompts.dirname;
      answers.botusername = this.options.initPrompts.botusername;
      answers.botemail = this.options.initPrompts.botemail;
      let log_text = ('* Generating ' +
                     this.options.initPrompts.application_type.italic +
                     ' ' +
                     this.options.initPrompts.application_lang.italic +
                     ' code from ' +
                     answers.python_bot_tpl.italic + ' template...').bold;
      console.log(log_text.bgRed.white);
      if (answers.python_bot_tpl=='Request/Reply') {
        this.fs.copyTpl(
          this.templatePath('python/bots/request-reply/requirements.txt'),
          this.destinationPath('requirements.txt'),
          answers
        );
        this.fs.copy(
          this.templatePath('python/bots/request-reply/src'),
          this.destinationPath('src')
        );
        this.fs.copyTpl(
          this.templatePath('python/bots/request-reply/config.json'),
          this.destinationPath('src/main/resources/config.json'),
          answers
        );
        this.fs.copy(
          this.templatePath('python/bots/request-reply/certificates'),
          this.destinationPath('certificates'),
          answers
        );
      }
      if (answers.python_bot_tpl=='NLP Based Trade Workflow') {
        this.fs.copyTpl(
          this.templatePath('python/bots/camunda-opennlp/requirements.txt'),
          this.destinationPath('requirements.txt'),
          answers
        );
        this.fs.copy(
          this.templatePath('python/bots/camunda-opennlp/src'),
          this.destinationPath('src')
        );
        this.fs.copyTpl(
          this.templatePath('python/bots/request-reply/config.json'),
          this.destinationPath('src/main/resources/config.json'),
          answers
        );
        this.fs.copy(
          this.templatePath('python/bots/camunda-opennlp/certificates'),
          this.destinationPath('certificates')
        );
        this.fs.copyTpl(
          this.templatePath('python/bots/camunda-opennlp/src/main/resources/nlp-config.json'),
          this.destinationPath('src/main/resources/nlp-config.json'),
          answers
        );
        this.fs.copy(
          this.templatePath('python/bots/camunda-opennlp/bpmn'),
          this.destinationPath('bpmn')
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
        RSAcertificateCreator.createRSA(answers.botusername, 'rsa' );
        // if (answers.java_bot_tpl=='Request/Reply') {
        //   this.fs.copy(
        //     this.templatePath('java/bots/request-reply/main-class-rsa/BotExample.java'),
        //     this.destinationPath('src/main/java/BotExample.java')
        //   );
        // } else {
        //   this.fs.copy(
        //   this.templatePath('java/bots/camunda-opennlp/main-class-rsa/BotExample.java'),
        //   this.destinationPath('src/main/java/BotExample.java')
        // );
        }

      let log_text_completion = ('* BOT generated successfully!!').bold;
      console.log(log_text_completion.bgGreen.white);
    });
  }
};
