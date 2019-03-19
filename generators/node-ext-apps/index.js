const Generator = require('yeoman-generator')
const colors = require('colors')
const certificateCreator = require('../lib/certificate-creator')
var mkdirp = require('mkdirp')

module.exports = class extends Generator {
  prompting () {
    return this.prompt([
      {
        type    : 'list',
        name    : 'node_ext_app_tpl',
        message : 'Which template do you want to start with',
        choices : ['Pizza Demo Extension App & Bot']
      }
    ]).then((answers) => {
      answers.application_name = this.options.initPrompts.application_name
      answers.subdomain = this.options.initPrompts.subdomain
      answers.dirname = this.options.initPrompts.dirname
      answers.botusername = this.options.initPrompts.botusername
      answers.botemail = this.options.initPrompts.botemail
      answers.encryption = this.options.initPrompts.encryption
      let log_text = ('* Generating ' +
                     this.options.initPrompts.application_type.italic +
                     ' ' +
                     this.options.initPrompts.application_lang.italic +
                     ' code from ' +
                     answers.node_ext_app_tpl.italic + ' template...').bold
      console.log(log_text.bgRed.white)

      if (answers.encryption === 'RSA') {
        answers.authType = 'rsa'
        answers.botCertPath = ''
        answers.botCertName = ''
        answers.botCertPassword = ''
        answers.botPrivateKeyPath = answers.dirname + '/rsa/'
        answers.botPrivateKeyName = 'rsa-private-' + answers.botusername + '.pem'
      } else if (answers.encryption === 'Self Signed Certificate') {
        answers.authType = 'cert'
        answers.botCertPath = answers.dirname + '/certificates/'
        answers.botCertName = answers.botusername + '.pem'
        answers.botCertPassword = 'changeit'
        answers.botPrivateKeyPath = ''
        answers.botPrivateKeyName = ''
      } else {
        answers.authType = 'cert'
        answers.botCertPath = ''
        answers.botCertName = ''
        answers.botCertPassword = ''
        answers.botPrivateKeyPath = ''
        answers.botPrivateKeyName = ''
      }

      if (answers.node_ext_app_tpl === 'Pizza Demo Extension App & Bot') {
        this.fs.copyTpl(
          this.templatePath('node/ext-apps/pizza-demo/index.js'),
          this.destinationPath('index.js'),
          answers
        )
        this.fs.copyTpl(
          this.templatePath('node/ext-apps/pizza-demo/package.json'),
          this.destinationPath('package.json'),
          answers
        )
        this.fs.copyTpl(
          this.templatePath('node/ext-apps/pizza-demo/config.json'),
          this.destinationPath('config.json'),
          answers
        )
        this.fs.copy(
          this.templatePath('node/ext-apps/pizza-demo/web'),
          this.destinationPath('web')
        )
        this.fs.copy(
          this.templatePath('node/ext-apps/pizza-demo/webcerts'),
          this.destinationPath('webcerts')
        )
      } else if (answers.node_ext_app_tpl === 'Dev Meetup AWS') {
        this.fs.copyTpl(
          this.templatePath('node/bots/dev-meetup-aws/index.js'),
          this.destinationPath('index.js'),
          answers
        )
        this.fs.copyTpl(
          this.templatePath('node/bots/dev-meetup-aws/package.json'),
          this.destinationPath('package.json'),
          answers
        )
        this.fs.copyTpl(
          this.templatePath('node/bots/dev-meetup-aws/config.json'),
          this.destinationPath('config.json'),
          answers
        )
      }

      /* Install certificate */
      if (answers.encryption === 'Self Signed Certificate') {
        let log_text_cert = ('* Generating certificate for BOT ' + answers.botusername + '...').bold
        console.log(log_text_cert.bgRed.white)
        mkdirp.sync('certificates')
        certificateCreator.create(answers.botusername, 'certificates')
      } else if (answers.encryption === 'RSA') {
        let log_text_cert = ('* Generating RSA public/private keys for BOT ' + answers.botusername + '...').bold
        console.log(log_text_cert.bgRed.white)
        mkdirp.sync('rsa')
        certificateCreator.createRSA(answers.botusername, 'rsa')
      }

      let log_text_completion = ('* BOT generated successfully!!').bold
      console.log(log_text_completion.bgGreen.white)
    })
  }
}
