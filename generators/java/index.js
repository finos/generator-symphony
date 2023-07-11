const Generator = require('yeoman-generator')
const path = require('path')
const fs = require('fs')
const axios = require('axios')
const keyPair = require('../_lib/rsa').keyPair

const COMMON_EXT_APP_TEMPLATES = '../../_common/circle-of-trust-ext-app'
const BASE_JAVA = 'src/main/java'
const BASE_RESOURCES = 'src/main/resources'

const BDK_VERSION_DEFAULT = '2.14.1'
const SPRING_VERSION_DEFAULT = '2.7.12'

// Make it configurable for faster test execution
const KEY_PAIR_LENGTH = 'KEY_PAIR_LENGTH'

const _getVersion = () => {
  const uri = 'https://search.maven.org/solrsearch/select?q=g:org.finos.symphony.bdk+AND+a:symphony-bdk-bom&core=gav'
  return axios(uri, { timeout: 5000 }).then(res => res.data)
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
    ])
  }

  async writing() {
    this.log()
    let basePackage = this.answers.basePackage.replaceAll(/\./g, '/')

    // copy input options as answers to be used in templates
    this.answers = {
      framework: 'java',
      ...this.options,
      ...this.answers,
      bdkBomVersion: BDK_VERSION_DEFAULT,
      springBootVersion: SPRING_VERSION_DEFAULT,
    }

    await _getVersion().then(response => {
      if (response['response']['docs'].length === 0) {
        console.log(`Failed to fetch latest Java BDK version from Maven Central, ${this.answers.bdkBomVersion} will be used.`)
      } else {
        this.answers.bdkBomVersion = response['response']['docs'].filter(d => !d.id.match(/(RC|alpha)/g))[0].v
      }
    }).catch(err => {
      console.log(`Failed to fetch latest Java BDK version from Maven Central, ${this.answers.bdkBomVersion} will be used.`)
      console.log(`The request failed because of: {errno: ${err.errno}, code: ${err.code}}`)
    })
    this.log(`BDK Version: ${this.answers.bdkBomVersion}`)

    if (this.answers.host !== 'develop2.symphony.com') {
      try {
        this.log('Generating RSA keys...'.green)
        this.pair = keyPair(this.config.get(KEY_PAIR_LENGTH) || 4096)
        this.fs.write(this.destinationPath('rsa/publickey.pem'), this.pair.public, err => this.log.error(err))
        this.fs.write(this.destinationPath('rsa/privatekey.pem'), this.pair.private, err => this.log.error(err))
      } catch (e) {
        this.log.error(`Oups, something went wrong when generating RSA key pair`, e)
      }
    }
    this.answers.privateKeyPath = 'rsa/privatekey.pem'

    if (this.answers.application === 'bot-app') { // Bot application
      // check if framework is setup or not
      if (this.answers.framework === 'java') {
        // process and copy config.yaml file
        this._copyTpl(
          path.join(this.answers.framework, 'config.yaml'),
          path.join(BASE_RESOURCES, 'config.yaml')
        )
      } else {
        // process and copy application.yaml.ejs file
        this._copyTpl(
          path.join(this.answers.framework, 'application.yaml'),
          path.join(BASE_RESOURCES, 'application.yaml')
        )
      }

      // process and copy template file
      this._copy('gif.ftl', path.join(BASE_RESOURCES, 'templates', 'gif.ftl'))
      this._copy('welcome.ftl', path.join(BASE_RESOURCES, 'templates', 'welcome.ftl'))

      // Process Framework specific files
      this._copyJavaTemplate(this.answers.framework, basePackage)
      // Process Common files
      this._copyJavaTemplate('common', basePackage)

    } else if (this.answers.application === 'ext-app') { // Extension app application
      // Process application.yaml.ejs file
      this._copyTpl('ext-app/application.yaml', path.join(BASE_RESOURCES, 'application.yaml'));

      // Process scripts files
      [ 'app.js', 'controller.js' ].forEach(f => this._copyTpl(
        path.join(COMMON_EXT_APP_TEMPLATES, 'scripts', f),
        path.join(BASE_RESOURCES, 'static', 'scripts', f)
      ));

      this._copy('ext-app/resources/', BASE_RESOURCES)
      this._copy(path.join(COMMON_EXT_APP_TEMPLATES, 'static'), BASE_RESOURCES + '/static')
      this._copyJavaTemplate('ext-app/java', basePackage)
      this._copy('ext-app/README.md', 'README.md')
    }

    // Process build files
    if (this.answers.build === 'Gradle') {
      this._processGradleFiles()
    } else {
      this._processMavenFiles()
    }

    // Process and copy .gitignore.tpl file
    this._copy('.gitignore.tpl', '.gitignore')
  }

  /**
   * Build Maven or Gradle project
   */
  install() {
    if (this.answers.build === 'Maven') {
      this._spawn('mvnw', 'package')
    } else {
      this._spawn('gradlew', 'build')
    }
  }

  _spawn(proc, arg) {
    try {
      this.log('Running '.green + `${proc} ${arg}`.white + ' in your project'.green)
      this.spawnCommandSync(path.join(this.destinationPath(), proc), [ arg ])
    } catch(e) {
      if (proc === 'gradle' || proc === 'mvn') {
        this.log(`${e}`.red)
      } else {
        this._spawn(proc.indexOf('gradle') > -1 ? 'gradle' : 'mvn', arg)
      }
    }
  }

  end() {
    if (this.pair) {
      this.log('\nYou can now update the service account '.cyan +
        `${this.answers.username}`.white + ` with the following public key: `.cyan)
      this.log('\n' + this.pair.public)
      this.log(`Please submit these details to your pod administrator.`.yellow)
      this.log(`If you are a pod administrator, visit https://${this.answers.host}/admin-console\n`.yellow)
    } else {
      this.log('\nYou can now place the private key you received in the '.yellow + 'rsa'.white + ' directory\n'.yellow)
    }
    this.log(`Your Java project has been successfully generated !`.cyan)
  }

  _copyJavaTemplate(dirPath, basePackage) {
    fs.readdirSync(path.join(__dirname, 'templates', dirPath))
      .filter(f => f.endsWith('java.ejs'))
      .map(f => f.replaceAll(/\.ejs/g, ''))
      .forEach(f => this._copyTpl(path.join(dirPath, f), path.join(BASE_JAVA, basePackage, f)))
  }

  _processGradleFiles() {
    [ 'gradlew', 'gradlew.bat', 'gradle/' ].forEach(f => this._copy(f))
    this._copyTpl('build.gradle')
  }

  _processMavenFiles() {
    [ 'mvnw', 'mvnw.cmd', '.mvn/' ].forEach(f => this._copy(f))
    this._copyTpl('pom.xml')
  }

  _copyTpl(fileName, destFileName) {
    this.fs.copyTpl(
      this.templatePath(`${fileName}.ejs`),
      this.destinationPath(destFileName || fileName),
      this.answers
    )
  }

  _copy(fileName, destFileName) {
    this.fs.copy(
      this.templatePath(fileName),
      this.destinationPath(destFileName || fileName)
    )
  }
}
