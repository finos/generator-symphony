const Generator = require('yeoman-generator');
const colors = require('colors');
const certificate = require('../certificate-creator');
var mkdirp = require('mkdirp'); // In your generator mkdirp.sync('/some/path/to/dir/');

module.exports = class extends Generator {
  prompting() {
    return this.prompt([
      {
        type    : 'list',
        name    : 'node_bot_tpl',
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
                     answers.node_bot_tpl.italic + ' template...').bold;
      console.log(log_text.bgRed.white);
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

        mkdirp.sync('certificates');
        certificate(answers,"certificates")

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

        mkdirp.sync('certificates');
        certificate(answers,"certificates")

        this.fs.copy(
          this.templatePath('node/bots/nlp-based/lib'),
          this.destinationPath('lib')
        );
      }
    });
  }
};
