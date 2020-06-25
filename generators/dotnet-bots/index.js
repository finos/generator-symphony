const Generator = require('yeoman-generator');
const CertificateCreator = require('../lib/certificate-creator');

module.exports = class extends Generator {
  prompting() {
    return this.prompt([
      {
        type: 'list',
        name: 'dotnet_bot_tpl',
        message: 'Which template do you want to start with',
        choices: ['Request/Reply']
      }
    ]).then((answers) => {
      Object.assign(answers, this.options.initPrompts);

      answers.botCertPath = '';
      answers.botCertName = '';
      answers.botCertPassword = '';
      answers.botRSAPath = '';
      answers.botRSAName = '';
      if (answers.encryption.startsWith('RSA')) {
        answers.botRSAPath = 'rsa/';
        answers.botRSAName = 'rsa-private-' + answers.botusername + '.pem';
      } else if (answers.encryption === 'Self Signed Certificate') {
        answers.botCertPath = 'certificates/';
        answers.botCertName = answers.botusername;
        answers.botCertPassword = 'changeit';
      }

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
