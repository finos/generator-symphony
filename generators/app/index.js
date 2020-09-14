const fs = require('fs')
const colors = require('colors')
const Generator = require('yeoman-generator')
const upath = require('upath')
const appSettings = require('../../package.json')

module.exports = class extends Generator {

  constructor (args, opts) {
    super(args, opts);

    this.argument('2.0', { type: Boolean, required: false });
  }

  initializing () {
    if (this.options['2.0'] === undefined) {
      const year = new Date().getYear() + 1900
      this.log('/------------------------------------------/'.cyan)
      this.log('/'.cyan + '        SYMPHONY GENERATOR  '.bold + appSettings.version.bold + '         /'.cyan)
      this.log('/    by platformsolutions@symphony.com     /'.cyan)
      this.log(`/ (c) ${year} Symphony Communication Services /`.cyan)
      this.log('/------------------------------------------/'.cyan)
    }
  }

  prompting () {

    if (this.options['2.0']) {
      return this.composeWith(require.resolve('../2.0'), this.options);
    }

    return this.prompt([
      {
        type: 'list',
        name: 'application_type',
        message: 'What do you want to create',
        choices: ['bot', 'application']
      },
      {
        type: 'input',
        name: 'application_name',
        message: 'What is the name of your project',
        default: this.appname
      },
      {
        type: 'input',
        name: 'subdomain',
        message: 'What is your POD subdomain',
        default: this.subdomain
      },
      {
        type: 'list',
        name: 'application_lang',
        message: 'What is your preferred programming language',
        choices: ['Java', '.Net', 'Node.js', 'Python'],
        when: function (answer) {
          return answer.application_type === "bot"
        }
      },
      {
        type: 'list',
        name: 'application_lang',
        message: 'What is your preferred programming language',
        choices: ['Java', 'Node.js'],
        when: function (answer) {
          return answer.application_type === "application"
        }
      },
      {
        type: 'input',
        name: 'botusername',
        message: 'What is the BOT username',
        default: 'megabot'
      },
      {
        type: 'input',
        name: 'botemail',
        message: 'What is the BOT email address',
        default: 'megabot@bot.symphony.com'
      },
      {
        type: 'list',
        name: 'encryption',
        message: 'What is your preferred encryption technology',
        choices: [
          'RSA - Generate New Keys',
          'RSA - Use Existing Keys',
          'Self Signed Certificate',
          'Signed Certificate'
        ]
      }
    ]).then((answers) => {
      answers.dirname = upath.normalize(process.cwd())
      answers.sessionAuthSuffix = (answers.encryption.startsWith('RSA')) ? '' : '-api'
      answers.keyAuthSuffix = (answers.encryption.startsWith('RSA')) ? '' : '-keyauth'

      const root = this
      fs.readdir('.', function(err, files) {
        if (err) return
        const isDirEmpty = files.filter(f => !f.startsWith('.')).length === 0
        const isDirNameAppName = process.cwd().endsWith(answers.application_name)
        if (!isDirEmpty && !isDirNameAppName) {
          root.destinationRoot(upath.normalize(process.cwd() + '/' + answers.application_name))
        }
      })

      let nextScript = undefined
      if (answers.application_type === 'application') {
        switch (answers.application_lang) {
          case 'Node.js':
            nextScript = '../node-ext-apps'
            break
          case 'Java':
            nextScript = '../java-ext-apps'
            break
        }
      } else {
        switch (answers.application_lang) {
          case 'Node.js':
            nextScript = '../node-bots'
            break
          case 'Java':
            nextScript = '../java-bots'
            break
          case '.Net':
            nextScript = '../dotnet-bots'
            break
          case 'Python':
            nextScript = '../python-bots'
            break
        }
      }
      this.composeWith(require.resolve(nextScript), { initPrompts: answers })
    }).catch(error => this.log(error))
  }
}
