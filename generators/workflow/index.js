const Generator = require('yeoman-generator')
const fs = require('fs')
const keyPair = require('../_lib/rsa').keyPair
const path = require('path')
const axios = require('axios')
const crypto = require('crypto')
const { Readable } = require('stream')
const { finished } = require('stream/promises')

// Make it configurable for faster test execution
const KEY_PAIR_LENGTH = 'KEY_PAIR_LENGTH'

const WDK_VERSION_DEFAULT = '1.6.3'

module.exports = class extends Generator {
  async prompting() {
    this.answers = await this.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Select your deployment option',
        choices: [
          { name: 'Core - Docker', value: 'docker-core' },
          { name: 'Core - JAR', value: 'jar' },
          { name: 'Core - Project', value: 'project' },
          { name: 'Studio - Docker', value: 'docker-studio' },
        ]
      },
      {
        type: 'input',
        name: 'appId',
        message: 'Enter your app id',
        default: 'wdk-studio',
        when: answer => answer.type === 'docker-studio'
      }
    ])
  }

  async getVersion() {
    this.log()
    this.options.wdkVersion = WDK_VERSION_DEFAULT
    const uri = 'https://search.maven.org/solrsearch/select?q=g:org.finos.symphony.wdk+AND+a:workflow-bot-app&core=gav&rows=10'
    await axios(uri, { timeout: 5000 })
      .then(res => res.data)
      .then(response => {
        this.options.wdkVersion = response['response']['docs'].filter(d => !d.v.match(/-pre/g))[0].v
      }).catch(err => {
        this.log(`The request failed because of: {errno: ${err.errno}, code: ${err.code}}`)
      })
    this.log(`WDK Version: ${this.options.wdkVersion}`)
  }

  async download() {
    if (this.answers.type === 'jar') {
      this.log('Downloading JAR..')
      const url = `https://search.maven.org/remotecontent?filepath=org/finos/symphony/wdk/workflow-bot-app/${this.options.wdkVersion}/workflow-bot-app-${this.options.wdkVersion}-boot.jar`
      const res = await fetch(url)
      const fileStream = fs.createWriteStream(this.destinationPath('workflow-bot-app.jar'), { flags: 'wx' })
      await finished(Readable.fromWeb(res.body).pipe(fileStream))
      this.log('Download complete')
    }
  }

  async writing() {
    if (this.options.host !== 'develop2.symphony.com') {
      try {
        this.log('Generating RSA keys...'.green)
        this.pair = keyPair(this.config.get(KEY_PAIR_LENGTH) || 4096)
        const prefix = (this.answers.type === 'docker-core' ? 'symphony/' : '') + 'rsa'
        this.fs.write(this.destinationPath(`${prefix}/publickey.pem`), this.pair.public, err => this.log.error(err))
        this.fs.write(this.destinationPath(`${prefix}/privatekey.pem`), this.pair.private, err => this.log.error(err))
      } catch (e) {
        this.log.error(`Oups, something went wrong when generating RSA key pair`, e)
      }
    }
    this.options.privateKeyPath = 'rsa/privatekey.pem'
    this.options.randomKey = crypto.randomBytes(16).toString('hex')

    if (this.answers.type === 'project') {
      const fileList = [ "gradle", "lib", "src", "gradlew", "gradlew.bat", "README.md", "workflows" ]
      fileList.forEach(f => this.fs.copy(this.templatePath(f), this.destinationPath(f)))
      this._copyTpl('build.gradle')
      this._copyTpl('application.yaml')
    } else if (this.answers.type === 'docker-core') {
      this._copyTpl('startup-core.sh', 'startup.sh')
      this.fs.copy(this.templatePath("workflows/ping.swadl.yaml"), this.destinationPath("symphony/workflows/ping.swadl.yaml"))
      this._copyTpl('application.yaml', 'symphony/application.yaml')
    } else if (this.answers.type === 'docker-studio') {
      this.options.appId = this.answers.appId
      this._copyTpl('startup-studio.sh', 'startup.sh')
      this._copyTpl('application-prod.yaml')
      fs.mkdirSync(path.join(this.destinationPath(), 'data'))
    } else if (this.answers.type === 'jar') {
        this._copyTpl('application.yaml')
        this.fs.copy(this.templatePath('workflows'), this.destinationPath('workflows'))
    }
  }

  install() {
    if (this.fs.exists(this.destinationPath("startup.sh"))) {
      fs.chmod(this.destinationPath("startup.sh"), 0o755, () => {})
    }
    if (this.answers.type === 'project') {
      this.log('Running '.green + './gradlew botJar'.white + ' in your project'.green)
      this.spawnCommandSync(path.join(this.destinationPath(), 'gradlew'), [ 'botJar' ])
    }
  }

  end() {
    if (this.pair) {
      this.log('\nYou can now update the service account '.cyan +
        `${this.options.username}`.white + ` with the following public key: `.cyan)
      this.log('\n' + this.pair.public)
      this.log(`Please submit these details to your pod administrator.`.yellow)
      this.log(`If you are a pod administrator, visit https://${this.options.host}/admin-console\n`.yellow)
    } else {
      this.log('\nYou can now place the private key you received in the '.yellow + 'rsa'.white + ' directory\n'.yellow)
    }

    if (this.answers.type === 'docker-studio') {
      this.log('Please update your ' + 'application-prod.yaml'.cyan + ' with a valid GitHub token and list of admin user ids')
      this.log('Refer to docs for more details: https://docs.developers.symphony.com/bots/getting-started/wdk#configuration\n')
    }

    this.log(`Your workflow project has been successfully generated !`.cyan)
  }

  _copyTpl(fileName, destFileName) {
    this.fs.copyTpl(
      this.templatePath(`${fileName}.ejs`),
      this.destinationPath(destFileName || fileName),
      this.options
    )
  }
}
