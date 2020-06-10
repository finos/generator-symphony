const Generator = require('yeoman-generator');
const CertificateCreator = require('../lib/certificate-creator');

module.exports = class extends Generator {
  prompting() {
    return this.prompt([
      {
        type: 'list',
        name: 'dotnet_bot_tpl',
        message: 'Which template do you want to start with',
        choices: ['Request/Reply', 'NLP Based Trade Order', 'Indication Of Interest', 'Trade Alert']
      }
    ]).then((answers) => {
      answers.application_name = this.options.initPrompts.application_name;
      answers.subdomain = this.options.initPrompts.subdomain;
      answers.sessionAuthSuffix = this.options.initPrompts.sessionAuthSuffix;
      answers.keyAuthSuffix = this.options.initPrompts.keyAuthSuffix;
      answers.dirname = this.options.initPrompts.dirname;
      answers.botusername = this.options.initPrompts.botusername;
      answers.botemail = this.options.initPrompts.botemail;

      let log_text = ('* Generating ' +
        this.options.initPrompts.application_type.italic +
        ' ' +
        this.options.initPrompts.application_lang.italic +
        ' code from ' +
        answers.dotnet_bot_tpl.italic + ' template...').bold;
      console.log(log_text.bgRed.white);
      if (answers.dotnet_bot_tpl == 'Request/Reply') {
        this.fs.copy(
          this.templatePath('dotnet/bots/request-reply/RequestResponse.csproj'),
          this.destinationPath('RequestResponse.csproj')
        );
        this.fs.copy(
          this.templatePath('dotnet/bots/request-reply/Program.cs'),
          this.destinationPath('Program.cs')
        );
        this.fs.copy(
          this.templatePath('dotnet/bots/request-reply/obj'),
          this.destinationPath('obj')
        );
        this.fs.copyTpl(
          this.templatePath('dotnet/bots/request-reply/config.json'),
          this.destinationPath('config.json'),
          answers
        );
        this.fs.copy(
          this.templatePath('dotnet/bots/request-reply/certificates'),
          this.destinationPath('certificates'),
          answers
        );
        /* Install certificate */
        CertificateCreator.create(this.options.initPrompts.encryption, answers.botusername, answers.botemail);
      }
    });
  }
};
