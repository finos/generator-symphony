const Generator = require('yeoman-generator');
const colors = require('colors');
const certificateCreator = require('../lib/p12-certificate-creator');
var mkdirp = require('mkdirp');

module.exports = class extends Generator {
  prompting() {
    return this.prompt([
      {
        type    : 'list',
        name    : 'java_bot_tpl',
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
                     answers.java_bot_tpl.italic + ' template...').bold;
      console.log(log_text.bgRed.white);
      if (answers.java_bot_tpl=='Request/Reply') {
        this.fs.copyTpl(
          this.templatePath('java/bots/request-reply/pom.xml'),
          this.destinationPath('pom.xml'),
          answers
        );
        this.fs.copy(
          this.templatePath('java/bots/request-reply/src'),
          this.destinationPath('src')
        );
        this.fs.copyTpl(
          this.templatePath('java/bots/request-reply/config.json'),
          this.destinationPath('src/main/resources/config.json'),
          answers
        );
        this.fs.copy(
          this.templatePath('java/bots/request-reply/certificates'),
          this.destinationPath('certificates'),
          answers
        );
      }
      if (answers.java_bot_tpl=='NLP Based Trade Workflow') {
        this.fs.copyTpl(
          this.templatePath('java/bots/camunda-opennlp/pom.xml'),
          this.destinationPath('pom.xml'),
          answers
        );
        this.fs.copy(
          this.templatePath('java/bots/camunda-opennlp/src'),
          this.destinationPath('src')
        );
        this.fs.copyTpl(
          this.templatePath('java/bots/request-reply/config.json'),
          this.destinationPath('src/main/resources/config.json'),
          answers
        );
        this.fs.copy(
          this.templatePath('java/bots/camunda-opennlp/certificates'),
          this.destinationPath('certificates')
        );
        this.fs.copyTpl(
          this.templatePath('java/bots/camunda-opennlp/src/main/resources/nlp-config.json'),
          this.destinationPath('src/main/resources/nlp-config.json'),
          answers
        );
        this.fs.copy(
          this.templatePath('java/bots/camunda-opennlp/bpmn'),
          this.destinationPath('bpmn')
        );
      }
      /* Install certificate */
      if (this.options.initPrompts.selfsigned_certificate=='Yes') {
        let log_text_cert = ('* Generating certificate for BOT ' + this.options.initPrompts.botusername + '...').bold;
        console.log(log_text_cert.bgRed.white);
        certificateCreator.create( this.options.initPrompts.botusername, this.options.initPrompts.botemail );
      }

      let log_text_completion = ('* BOT generated successfully!!').bold;
      console.log(log_text_completion.bgGreen.white); 
    });
  }
};
