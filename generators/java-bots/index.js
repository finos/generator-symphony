const Generator = require('yeoman-generator');
const colors = require('colors');

module.exports = class extends Generator {
  prompting() {
    return this.prompt([
      {
        type    : 'list',
        name    : 'java_bot_tpl',
        message : 'Which template do you want to start with',
        choices : ['Request/Reply', 'NLP Based Trade Order', 'Indication Of Interest', 'Trade Alert']
      }
    ]).then((answers) => {
      answers.application_name = this.options.initPrompts.application_name;
      answers.subdomain = this.options.initPrompts.subdomain;
      answers.dirname = this.options.initPrompts.dirname;
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
    });
  }
};
