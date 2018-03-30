const Generator = require('yeoman-generator');
const colors = require('colors');

module.exports = class extends Generator {
  prompting() {
    return this.prompt([
      {
        type    : 'list',
        name    : 'node_bot_tpl',
        message : 'Which template do you want to start with',
        choices : ['Request/Reply', 'Indication Of Interest', 'Trade Alert']
      }
    ]).then((answers) => {
      answers.application_name = this.options.initPrompts.application_name;
      if (answers.node_bot_tpl=='Request/Reply') {
        let log_text = ('* Generating ' +
                       this.options.initPrompts.application_type.italic +
                       ' ' +
                       this.options.initPrompts.application_lang.italic +
                       ' code from ' +
                       answers.node_bot_tpl.italic + ' template...').bold;
        console.log(log_text.bgRed.white);
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
        this.fs.copy(
          this.templatePath('node/bots/request-reply/certificates'),
          this.destinationPath('certificates')
        );
      };
    });
  }
};
