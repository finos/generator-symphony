const colors = require('colors');
const Generator = require('yeoman-generator');

module.exports = class extends Generator {

  constructor(args, opts) {
    super(args, opts);
    this.log('/------------------------------------------/'.cyan);
    this.log('/          SYMPHONY GENERATOR 1.0          /'.cyan);
    this.log('/    by platformsolutions@symphony.com     /'.cyan);
    this.log('/ (c) 2018 Symphony Communication Services /'.cyan);
    this.log('/------------------------------------------/'.cyan);
  }

  init() {

  }

  prompting() {
    return this.prompt([
      {
        type    : 'list',
        name    : 'application_type',
        message : 'What do you want to create',
        choices : ['bot', 'application']
      },
      {
        type    : 'input',
        name    : 'application_name',
        message : 'What is the name of your project',
        default : this.appname
      },
      {
        type    : 'input',
        name    : 'subdomain',
        message : 'What is your POD subdomain',
        default : this.subdomain
      },
      {
        type    : 'list',
        name    : 'application_lang',
        message : 'What is your preferred programming language',
        choices : ['Java', '.Net', 'Node.js']
      }
    ]).then((answers) => {
      answers.dirname = process.cwd();
      if (answers.application_type=='bot' && answers.application_lang=='Node.js') {
        this.composeWith(require.resolve('../node-bots'), {initPrompts: answers});
      } else if (answers.application_type=='bot' && answers.application_lang=='Java') {
        this.composeWith(require.resolve('../java-bots'), {initPrompts: answers});
      }
    });
  }

};
