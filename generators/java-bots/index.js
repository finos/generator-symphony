const Generator = require('yeoman-generator')
const axios = require('axios')
const CertificateCreator = require('../lib/certificate-creator')

module.exports = class extends Generator {
  prompting () {
    return this.prompt([
      {
        type: 'list',
        name: 'java_bot_tpl',
        message: 'Which template do you want to start with',
        choices: ['Request/Reply', 'NLP Based Trade Workflow', 'Elements Form', 'ExpenseBot']
      }
    ]).then((answers) => {
      answers.application_name = this.options.initPrompts.application_name
      answers.subdomain = this.options.initPrompts.subdomain
      answers.sessionAuthSuffix = this.options.initPrompts.sessionAuthSuffix
      answers.keyAuthSuffix = this.options.initPrompts.keyAuthSuffix
      answers.dirname = this.options.initPrompts.dirname
      answers.botusername = this.options.initPrompts.botusername
      answers.botemail = this.options.initPrompts.botemail
      answers.encryption = this.options.initPrompts.encryption
      let log_text = ('* Generating ' +
        this.options.initPrompts.application_type.italic +
        ' ' +
        this.options.initPrompts.application_lang.italic +
        ' code from ' +
        answers.java_bot_tpl.italic + ' template...').bold
      console.log(log_text.bgRed.white)

      if (answers.encryption.startsWith('RSA')) {
        answers.authType = 'rsa'
        answers.botCertPath = ''
        answers.botCertName = ''
        answers.botCertPassword = ''
        answers.botRSAPath = 'rsa/'
        answers.botRSAName = 'rsa-private-' + answers.botusername + '.pem'
      } else if (answers.encryption === 'Self Signed Certificate') {
        answers.authType = 'cert'
        answers.botCertPath = 'certificates/'
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

      let mavenSearchUrlRoot = 'https://search.maven.org/solrsearch/select?q=g:com.symphony.platformsolutions+AND+a:';

      (async () => {
        if (['Request/Reply', 'Elements Form', 'ExpenseBot'].indexOf(answers.java_bot_tpl) > -1) {
          this.log('Looking for latest version of Java client library..')
          const javaClientLibResponse = await axios.get(mavenSearchUrlRoot + 'symphony-api-client-java')
          answers.java_client_library_version = javaClientLibResponse.data['response']['docs'][0]['latestVersion']
          this.log('Latest version of Java client library is', answers.java_client_library_version)

          let subDir = 'request-reply'
          switch (answers.java_bot_tpl) {
            case 'Elements Form':
              subDir = 'elements'
              break
            case 'ExpenseBot':
              subDir = 'expense-bot'
              break
          }

          const rootDir = `java/bots/${subDir}`;

            [ 'pom.xml', 'src', 'config.json', 'certificates' ].forEach(file => {
              const prefix = (file.indexOf('.json') > 0) ? 'src/main/resources/' : ''

              if (file.indexOf('.') > 0) {
                this.fs.copyTpl(
                  this.templatePath(`${rootDir}/${file}`),
                  this.destinationPath(`${prefix}${file}`),
                  answers
                )
              } else {
                this.fs.copy(
                  this.templatePath(`${rootDir}/${file}`),
                  this.destinationPath(`${file}`)
                )
              }
            })
        } else if (answers.java_bot_tpl === 'NLP Based Trade Workflow') {
          this.log('Looking for latest version of Camunda library..')
          const camundaLibResponse = await axios.get(mavenSearchUrlRoot + 'symphony-camunda-client')
          answers.camunda_library_version = camundaLibResponse.data['response']['docs'][0]['latestVersion']
          this.log('Latest version of Camunda library is', answers.camunda_library_version)

          this.log('Looking for latest version of NLP library..')
          const nlpLibResponse = await axios.get(mavenSearchUrlRoot + 'symphony-opennlp-java')
          answers.nlp_library_version = nlpLibResponse.data['response']['docs'][0]['latestVersion']
          this.log('Latest version of NLP library is', answers.nlp_library_version)

            [ 'pom.xml', 'src', 'nlp-config.json', 'certificates', 'bpmn', 'config.json' ].forEach(file => {
              const prefix = (file.indexOf('.json') > 0) ? 'src/main/resources/' : ''
              const subDir = (file === 'config.json') ? 'request-reply' : 'camunda-opennlp'
              const rootDir = `java/bots/${subDir}`

              if (file.indexOf('.') > 0) {
                this.fs.copyTpl(
                  this.templatePath(`${rootDir}/${file}`),
                  this.destinationPath(`${prefix}${file}`),
                  answers
                )
              } else {
                this.fs.copy(
                  this.templatePath(`${rootDir}/${file}`),
                  this.destinationPath(`${file}`)
                )
              }
            })
        }

        /* Install certificate */
        console.log('generating from template ' + answers.java_bot_tpl)
        CertificateCreator.create(this.options.initPrompts.encryption, answers.botusername, answers.botemail)

        if (answers.encryption.startsWith('RSA')) {
          const { mainClass, subDir } = [
            { type: 'Request/Reply', mainClass: 'RequestReplyBot', subDir: 'request-reply' },
            { type: 'NLP Based Trade Workflow', mainClass: 'NLPBot', subDir: 'camunda-opennlp' },
            { type: 'Elements Form', mainClass: 'ElementsBot', subDir: 'elements' },
            { type: 'ExpenseBot', mainClass: 'ExpenseBot', subDir: 'expense-bot' }
          ].filter(template => template.type === answers.java_bot_tpl)[0]

          this.fs.copy(
            this.templatePath(`java/bots/${subDir}/main-class-rsa/${mainClass}.java`),
            this.destinationPath(`src/main/java/${mainClass}.java`)
          )
        }

        let log_text_completion = ('* BOT generated successfully!!').bold
        console.log(log_text_completion.bgGreen.white)
      })()
    })
  }
}
