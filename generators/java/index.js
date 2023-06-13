const Generator = require('yeoman-generator');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const keyPair = require('../_lib/rsa').keyPair;

const COMMON_EXT_APP_TEMPLATES = '../../_common/circle-of-trust-ext-app'
const BASE_JAVA = 'src/main/java';
const BASE_RESOURCES = 'src/main/resources';

const BDK_VERSION_DEFAULT = '2.14.1';
const SPRING_VERSION_DEFAULT = '2.7.12'

// Make it configurable for faster test execution
const KEY_PAIR_LENGTH = 'KEY_PAIR_LENGTH';

const _getVersion = () => {
  return axios.get('https://search.maven.org/solrsearch/select?q=g:org.finos.symphony.bdk')
    .then(res => res.data);
}

module.exports = class extends Generator {
  async prompting() {
    this.answers = await this.prompt([
      {
        type: 'list',
        name: 'build',
        message: 'Select your build system',
        choices: [
          'Maven',
          'Gradle',
        ]
      },
      {
        type: 'input',
        name: 'groupId',
        message: 'Enter your project groupId',
        default: 'com.mycompany'
      },
      {
        type: 'input',
        name: 'artifactId',
        message: 'Enter your project artifactId',
        default: 'bot-application'
      },
      {
        type: 'input',
        name: 'basePackage',
        message: 'Enter your base package',
        default: 'com.mycompany.bot'
      }
    ]);
  }

  async writing() {
    let basePackage = this.answers.basePackage.split('.').join('/');

    // copy input options as answers to be used in templates
    this.answers.host = this.options.host;
    this.answers.username = this.options.username;
    this.answers.framework = this.options.framework;
    this.answers.application = this.options.application;
    this.answers.appId = this.options.appId;

    this.answers.bdkBomVersion = BDK_VERSION_DEFAULT;
    this.answers.springBootVersion = SPRING_VERSION_DEFAULT;

    await _getVersion().then(response => {
      if (response['response']['docs'].length === 0) {
        console.log(`Failed to fetch latest Java BDK version from Maven Central, ${this.answers.bdkBomVersion} will be used.`);
      } else {
        this.answers.bdkBomVersion = response['response']['docs'][0]['latestVersion'];
      }
    }).catch(err => {
      console.log(`Failed to fetch latest Java BDK version from Maven Central, ${this.answers.bdkBomVersion} will be used.`);
      console.log(`The request failed because of: {errno: ${err.errno}, code: ${err.code}}`);
    });

    if (this.answers.host !== 'develop2.symphony.com') {
      try {
        this.log('Generating RSA keys...'.green.bold);
        this.pair = keyPair(this.config.get(KEY_PAIR_LENGTH) || 4096);
        this.fs.write(this.destinationPath('rsa/publickey.pem'), this.pair.public, err => this.log.error(err));
        this.fs.write(this.destinationPath('rsa/privatekey.pem'), this.pair.private, err => this.log.error(err));
      } catch (e) {
        this.log.error(`Oups, something went wrong when generating RSA key pair`, e);
      }
    }
    this.answers.privateKeyPath = 'rsa/privatekey.pem';

    if (this.answers.application === 'bot-app') { // Bot application
      // check if framework is setup or not
      switch (this.answers.framework) {
        case 'java':
          // process and copy config.yaml file
          this.fs.copyTpl(
            this.templatePath(path.join(this.answers.framework, 'config.yaml.ejs')),
            this.destinationPath(path.join(BASE_RESOURCES, 'config.yaml')),
            this.answers
          );
          break;
        case 'spring':
          // process and copy application.yaml.ejs file
          this.fs.copyTpl(
            this.templatePath(path.join(this.answers.framework, 'application.yaml.ejs')),
            this.destinationPath(path.join(BASE_RESOURCES, 'application.yaml')),
            this.answers
          );
          break;
      }

      // process and copy template file
      this.fs.copyTpl(
        this.templatePath('gif.ftl'),
        this.destinationPath(path.join(BASE_RESOURCES, 'templates', 'gif.ftl'))
      );
      this.fs.copyTpl(
        this.templatePath('welcome.ftl'),
        this.destinationPath(path.join(BASE_RESOURCES, 'templates', 'welcome.ftl'))
      );

      // Process Framework specific files
      this._copyJavaTemplate(this.answers.framework, basePackage);
      // Process Common files
      this._copyJavaTemplate('common', basePackage);

    } else if (this.answers.application === 'ext-app') { // Extension app application
      // Process application.yaml.ejs file
      this.fs.copyTpl(
        this.templatePath('ext-app/application.yaml.ejs'),
        this.destinationPath(path.join(BASE_RESOURCES, 'application.yaml')),
        this.answers
      );

      // Process scripts files
      ['app.js.ejs', 'controller.js.ejs'].forEach(file => {
        this.fs.copyTpl(
          this.templatePath(path.join(COMMON_EXT_APP_TEMPLATES, 'scripts', file)),
          this.destinationPath(path.join(BASE_RESOURCES, 'static/scripts', file.substr(0, file.indexOf('.ejs')))),
          this.answers
        );
      })

      this.fs.copyTpl(
        this.templatePath('ext-app/resources/'),
        this.destinationPath(BASE_RESOURCES),
      );

      this.fs.copyTpl(
        this.templatePath(path.join(COMMON_EXT_APP_TEMPLATES, 'static')),
        this.destinationPath(BASE_RESOURCES + '/static'),
      );

      this._copyJavaTemplate('ext-app/java', basePackage);

      this.fs.copyTpl(
        this.templatePath('ext-app/README.md'),
        this.destinationPath('README.md')
      );
    }

    // Process build files
    if (this.answers.build === 'Gradle') {
      this._processGradleFiles();
    } else {
      this._processMavenFiles();
    }

    // Process and copy .gitignore.tpl file
    this.fs.copyTpl(
      this.templatePath('.gitignore.tpl'),
      this.destinationPath('.gitignore')
    );
  }

  /**
   * Build Maven or Gradle project
   */
  install() {
    if (this.answers.build === 'Maven') {
      try {
        this.log('Running '.green.bold + './mvnw package'.white.bold + ' in your project'.green.bold);
        this.spawnCommandSync(path.join(this.destinationPath(), 'mvnw'), ['package']);
      } catch(e) {
        try {
          this.log('Running '.green.bold + 'mvn package'.white.bold + ' in your project'.green.bold);
          this.spawnCommandSync('mvn', ['package']);
        } catch(e) {
          this.log(`${e}`.green.bold);
        }
      }
    } else {
      try {
        this.log('Running '.green.bold + './gradlew build'.white.bold + ' in your project'.green.bold);
        this.spawnCommandSync(path.join(this.destinationPath(), 'gradlew'), ['build']);
      } catch(e) {
        try {
          this.log('Running '.green.bold + 'gradle build'.white.bold + ' in your project'.green.bold);
          this.spawnCommandSync('gradle', ['build']);
        } catch(e) {
          this.log(`${e}`.green.bold);
        }
      }
    }
  }

  end() {
    if (this.pair) {
      this.log('\nYou can now update the service account '.cyan +
        `${this.answers.username}`.white.bold + ` with the following public key: `.cyan);
      this.log('\n' + this.pair.public);
      this.log(`Please submit these details to your pod administrator.`.yellow);
      this.log(`If you are a pod administrator, visit https://${this.answers.host}/admin-console\n`.yellow);
    } else {
      this.log('\nYou can now place the private key you received in the '.yellow + 'rsa'.white + ' directory\n'.yellow);
    }
    this.log(`Your Java project has been successfully generated !`.cyan.bold);
  }

  _copyJavaTemplate(dirPath, basePackage) {
    let files = fs.readdirSync(path.join(__dirname, 'templates', dirPath))
    files.filter(f => f.endsWith('java.ejs')).forEach(file => {
      this.fs.copyTpl(
        this.templatePath(path.join(dirPath, file)),
        this.destinationPath(path.join(BASE_JAVA, basePackage, file.substr(0, file.length - 4))),
        this.answers
      );
    });
  }

  _processGradleFiles() {
    this.fs.copyTpl(
      this.templatePath('gradlew'),
      this.destinationPath('gradlew')
    );

    this.fs.copyTpl(
      this.templatePath('gradlew.bat'),
      this.destinationPath('gradlew.bat')
    );

    this.fs.copyTpl(
      this.templatePath('gradle/'),
      this.destinationPath('gradle/')
    );

    this.fs.copyTpl(
      this.templatePath('build.gradle.ejs'),
      this.destinationPath('build.gradle'),
      this.answers
    );
  }

  _processMavenFiles() {
    this.fs.copyTpl(
      this.templatePath('mvnw'),
      this.destinationPath('mvnw')
    );

    this.fs.copyTpl(
      this.templatePath('mvnw.cmd'),
      this.destinationPath('mvnw.cmd')
    );

    this.fs.copyTpl(
      this.templatePath('.mvn/'),
      this.destinationPath('.mvn/')
    );

    this.fs.copyTpl(
      this.templatePath('pom.xml.ejs'),
      this.destinationPath('pom.xml'),
      this.answers
    );
  }
}
