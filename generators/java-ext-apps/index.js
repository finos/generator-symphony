const Generator = require('yeoman-generator')
const colors = require('colors')
const https = require('https')
const certificateCreator = require('../lib/p12-certificate-creator')
const RSAcertificateCreator = require('../lib/certificate-creator')
var mkdirp = require('mkdirp')

module.exports = class extends Generator {
  prompting () {
    return this.prompt([
      {
        type    : 'list',
        name    : 'java_ext_app_tpl',
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
                     answers.java_ext_app_tpl.italic + ' template...').bold
      console.log(log_text.bgRed.white)

      if (answers.encryption === 'RSA') {
        answers.authType = 'rsa'
        answers.botCertPath = ''
        answers.botCertName = ''
        answers.botCertPassword = ''
        answers.botRSAPath = answers.dirname + '/rsa/'
        answers.botRSAName = 'rsa-private-' + answers.botusername + '.pem'
      } else if (answers.encryption === 'Self Signed Certificate') {
        answers.authType = 'cert'
        answers.botCertPath = answers.dirname + '/certificates/'
        answers.botCertName = answers.botusername
        answers.botCertPassword = 'changeit'
        answers.botRSAPath = ''
        answers.botRSAName = ''
      } else {
        answers.authType = 'cert'
        answers.botCertPath = ''
        answers.botCertName = ''
        answers.botCertPassword = ''
        answers.botRSAPath = ''
        answers.botRSAName = ''
      }

      this.log('Looking for latest version of java client library..')
      let mavenSearchUrl = 'https://search.maven.org/solrsearch/select?q=g:com.symphony.platformsolutions+AND+a:symphony-api-client-java'
      https.get(mavenSearchUrl, (resp) => {
        let data = ''
        resp.on('data', (chunk) => { data += chunk })
        resp.on('end', () => {
          let responseJson = JSON.parse(data)
          answers.java_client_library_version = responseJson.response.docs[0].latestVersion
          this.log('Latest version is', answers.java_client_library_version)

          if (answers.java_ext_app_tpl === 'Pizza Demo Extension App & Bot') {
            this.fs.copyTpl(
              this.templatePath('java/pizza-demo/pom.xml'),
              this.destinationPath('pom.xml'),
              answers
            )
            this.fs.copy(
              this.templatePath('java/pizza-demo/src'),
              this.destinationPath('src')
            )
            this.fs.copyTpl(
              this.templatePath('java/pizza-demo/config.json'),
              this.destinationPath('src/main/resources/config.json'),
              answers
            )
          }
          /* Install certificate */
          console.log('generating from template ' + answers.java_ext_app_tpl)
          if (answers.encryption === 'Self Signed Certificate') {
            let log_text_cert = ('* Generating certificate for BOT ' + answers.botusername + '...').bold
            console.log(log_text_cert.bgRed.white)
            certificateCreator.create(answers.botusername, 'certificates')
          } else if (answers.encryption === 'RSA') {
            let log_text_cert = ('* Generating RSA public/private keys for BOT ' + answers.botusername + '...').bold
            console.log(log_text_cert.bgRed.white)
            mkdirp.sync('rsa')
            RSAcertificateCreator.createRSA(answers.botusername, 'rsa')
          }

          let log_text_completion = ('* BOT generated successfully!!').bold
          console.log(log_text_completion.bgGreen.white)
        })
      }).on('error', (err) => {
        this.log('Error: ' + err.message)
      })
    })
  }
}
