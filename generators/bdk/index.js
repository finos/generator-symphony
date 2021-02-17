const Generator = require('yeoman-generator');
const colors = require('colors');
const packageJson = require('../../package.json');
const fs = require('fs')

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

    try {
      const folderFiles = fs.readdirSync(this.destinationRoot());
      if (folderFiles.length > 0) {
        this.log(`(!) Folder ${this.destinationRoot()} is not empty. Are you sure you want to continue?`.red);
      }
    } catch(e) {
      this.log(e);
    }
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
        name: 'language',
        message: 'Select your programing language',
        choices: [
          'Java (beta)'
        ]
      }
    ]);

    if (this.answers.language === 'Java (beta)') {
      this.composeWith(require.resolve('./java'), this.answers);
    }
  }
}
