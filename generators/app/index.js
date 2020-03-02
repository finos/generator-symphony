const fs = require('fs');
const Generator = require('yeoman-generator');
const upath = require('upath');
const header = require('./header');

const MODULES = {
  application: {
    node: {
      path: '../node-ext-apps'
    },
    java: {
      path: '../java-ext-apps'
    }
  },
  bot: {
    node: {
      path: '../node-bots'
    },
    java: {
      path: '../java'
    },
    dotnet: {
      path: '../dotnet-bots'
    },
    python: {
      path: '../python-bots'
    }
  }
};

const projectType = {
  bot: 'bot',
  application: 'application'
};
Object.defineProperty(projectType, 'all', { get: function() { return Object.values(this)}, enumerable: false});

const language = {
  java: 'Java',
  node: 'Node.js',
  dotnet: '.Net',
  python: 'Python'
};
Object.defineProperty(language, 'all', { get: function() { return Object.values(this)}, enumerable: false});

/**
 * Generator entry point.
 */
module.exports = class extends Generator {

  constructor (args, opts) {
    super(args, opts);
  }

  /**
   * Displays the Welcome header (current version, year, etc.)
   */
  initializing () {
    header.display(this.log);
  }

  /**
   * Displays the initial menu (application type, language, auth, etc.)
   */
  prompting () {

    function selectNextScript(type, lang) {
      if (type === projectType.application) {
        switch (lang) {
          case language.node: return MODULES.application.node.path;
          case language.java: return MODULES.application.java.path;
        }
      } else {
        switch (lang) {
          case language.node: return MODULES.bot.node.path;
          case language.java: return MODULES.bot.java.path;
          case language.dotnet: return MODULES.bot.dotnet.path;
          case language.python: return MODULES.bot.python.path;
        }
      }
    }

    return this.prompt([
      {
        type: 'list',
        name: 'application_type',
        message: 'What do you want to create',
        choices: projectType.all
      },
      {
        type: 'input',
        name: 'application_name',
        message: 'What is the name of your project',
        default: this.determineAppname()
      },
      {
        type: 'input',
        name: 'subdomain',
        message: 'What is your POD subdomain',
        default: 'acme'
      },
      {
        type: 'list',
        name: 'application_lang',
        message: 'What is your preferred programming language',
        choices: language.all
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
        default: 'megabot@acme.symphony.com'
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
    ]).then(answers => {

      answers.dirname = upath.normalize(process.cwd());

      answers.generateRsaKeys = answers.encryption === 'RSA - Generate New Keys';
      answers.generateCertificate = answers.encryption === 'Self Signed Certificate';

      answers.sessionAuthSuffix = !answers.encryption.startsWith('RSA') ? '-api' : '';
      answers.keyAuthSuffix = !answers.encryption.startsWith('RSA') ? '-keyauth' : '';

      const nextStep = selectNextScript(answers.application_type, answers.application_lang);

      if (answers.application_lang === language.java) {
        this.composeWith(require.resolve(nextStep), answers);
      }
      // preserve backward compatibility with other languages
      else {
        const files = fs.readdirSync(answers.dirname);
        const isDirEmpty = files.filter(f => !f.startsWith('.')).length === 0;
        const isDirNameAppName = process.cwd().endsWith(answers.application_name);
        if (!isDirEmpty && !isDirNameAppName) {
          this.destinationRoot(upath.normalize(process.cwd() + '/' + answers.application_name));
        }

        this.composeWith(require.resolve(nextStep), { initPrompts: answers });
      }
    })
  }
};
