const Generator = require('yeoman-generator');
const colors = require('colors');
const packageJson = require('../../package.json');

module.exports = class extends Generator {

  constructor(args, opts) {
    super(args, opts);
  }

  initializing() {

    this.log(` __   __     ___                 _
 \\ \\ / /__  / __|_  _ _ __  _ __| |_  ___ _ _ _  _
  \\ V / _ \\ \\__ \\ || | '  \\| '_ \\ ' \\/ _ \\ ' \\ || |
   |_|\\___/ |___/\\_, |_|_|_| .__/_||_\\___/_||_\\_, |
                 |__/      |_|                |__/ `.blue);
    this.log('\thttps://developers.symphony.com\n');
    this.log('Welcome to Symphony Generator '.gray + `v${packageJson.version}`.yellow);
    this.log('Application files will be generated in folder: '.gray + `${this.destinationRoot()}`.yellow);
    this.log('______________________________________________________________________________________________________'.yellow);
  }

  async prompting() {
    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'host',
        message: 'Enter your pod host',
        default: 'acme.symphony.com'
      },
      {
        type: 'input',
        name: 'username',
        message: 'Enter your bot username',
        default: 'my-bot'
      },
      {
        type: 'list',
        name: 'application',
        message: 'Select your type of application',
        choices: [
          {
            name: 'Bot Application',
            value: 'bot-app'
          },
          {
            name: 'Extension App Application',
            value: 'ext-app'
          }
        ]
      },
      {
        type: 'list',
        name: 'language',
        message: 'Select your programing language',
        choices: [
          {
            name: 'Java (beta)',
            value: 'java'
          }
        ],
        when: answer => answer.application === 'bot-app'
      },
      {
        type: 'list',
        name: 'framework',
        message: 'Select your framework',
        choices: [
          {
            name: 'Java (no framework)',
            value: 'java'
          },
          {
            name: 'Spring Boot (experimental)',
            value: 'spring'
          }
        ],
        when: answer => answer.application === 'bot-app' && answer.language === 'java'
      },
      {
        type: 'input',
        name: 'appId',
        message: 'Enter your app id',
        default: 'app-id',
        when: answer => answer.application === 'ext-app'
      }
    ]);

    if (this.answers.language === 'java' || this.answers.application === 'ext-app') {
      this.composeWith(require.resolve('./java'), this.answers);
    }
  }
}
