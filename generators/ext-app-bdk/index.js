const Generator = require('yeoman-generator')
const fs = require('fs')
const { Readable } = require('stream')
const { finished } = require('stream/promises')
const { getAdkVersion, getJavaBdkVersion, getPythonBdkVersion, getSpringVersion } = require('../_lib/util')
const EXT_APP_PREFIX = '../../ext-app/templates'
const JAVA_PREFIX = '../../java/templates'
const PYTHON_PREFIX = '../../python/templates'

module.exports = class extends Generator {
  async prompting() {
    this.answers = await this.prompt([
      {
        type: 'list',
        name: 'script',
        message: 'Select your frontend language',
        choices: [
          'JavaScript',
          'TypeScript',
        ]
      },
      {
        type: 'list',
        name: 'bdk',
        message: 'Select your backend language',
        choices: [
          'Java',
          'Python',
        ]
      },
      {
        type: 'input',
        name: 'basePackage',
        message: 'Enter your base package',
        default: 'com.mycompany',
        when: answer => answer.bdk === 'Java',
      },
      {
        type: 'list',
        name: 'build',
        message: 'Select your build system',
        choices: [
          'Maven',
          'Gradle',
        ],
        when: answer => answer.bdk === 'Java',
      },
    ])

    this.log()
    this.answers = {
      ...this.options,
      ...this.answers,
      appId: this.options.host === 'develop2.symphony.com' ? 'localhost-4000' : this.options.appId,
      adkVersion: await getAdkVersion(),
      bdkVersion: await (this.answers.bdk === 'Java' ? getJavaBdkVersion() : getPythonBdkVersion()),
      springBootVersion: this.answers.bdk === 'Java' ? await getSpringVersion() : null,
    }
  }

  writeAdk() {
    this.log(`Using ADK Version: ${this.answers.adkVersion}`)
    if (this.answers.script === 'JavaScript') {
      const prefix = EXT_APP_PREFIX + '/app-view/javascript'
      this._copy(`${prefix}/webpack.config.js`, 'web/webpack.config.js')
      this._copy(`${prefix}/.babelrc`, 'web/.babelrc')
      this._copyTpl(`${prefix}/package.json`, 'web/package.json')
      this._copyTpl('app-view/index.js', 'web/src/index.js')
      this._copyTpl('app-view/view-abc.jsx', 'web/src/views/view-abc.jsx')
    } else {
      const prefix = EXT_APP_PREFIX + '/app-view/typescript'
      this._copy(`${prefix}/webpack.config.js`, 'web/webpack.config.js')
      this._copy(`${prefix}/tsconfig.json`, 'web/tsconfig.json')
      this._copyTpl(`${prefix}/package.json`, 'web/package.json')
      this._copyTpl('app-view/index.ts', 'web/src/index.ts')
      this._copyTpl('app-view/view-abc.tsx', 'web/src/views/view-abc.tsx')
    }
    this._copy(EXT_APP_PREFIX + '/app-view/view-abc.css', 'web/src/views/view-abc.css')
    this._copyTpl(EXT_APP_PREFIX + '/bundle.json', 'web/bundle.json')
  }

  async writeBdk() {
    this.log(`Using BDK Version: ${this.answers.bdkVersion}`)
    fs.mkdirSync('./backend/rsa', { recursive: true })
    if (this.answers.host !== 'develop2.symphony.com') {
      try {
        this.log('Generating RSA keys...'.green)
        this.pair = keyPair(this.config.get('KEY_PAIR_LENGTH'))
        this.fs.write(this.destinationPath('backend/rsa/publickey.pem'), this.pair.public, err => this.log.error(err))
        this.fs.write(this.destinationPath('backend/rsa/privatekey.pem'), this.pair.private, err => this.log.error(err))
      } catch (e) {
        this.log.error(`Oops, something went wrong when generating RSA key pair`, e)
      }
    } else {
      this.log('Downloading sandbox key..')
      const url = `https://localhost-rsa.vercel.app/private.pem`
      const res = await fetch(url)
      const fileStream = fs.createWriteStream(this.destinationPath('backend/rsa/privatekey.pem'), { flags: 'wx' })
      await finished(Readable.fromWeb(res.body).pipe(fileStream))
      this.log('Download complete')
    }
    this.answers.privateKeyPath = 'rsa/privatekey.pem'

    if (this.answers.bdk === 'Java') {
      const basePackagePath = this.answers.basePackage.replaceAll(/\./g, '/')
      this._copyTpl('java/application.yaml', 'backend/src/main/resources/application.yaml')
      this._copyTpl('java/App.java', `backend/src/main/java/${basePackagePath}/App.java`)
      this._copyTpl('java/SecurityConfig.java', `backend/src/main/java/${basePackagePath}/SecurityConfig.java`)

      if (this.answers.build === 'Gradle') {
        [ 'gradlew', 'gradlew.bat', 'gradle/' ].forEach(f => this._copy(`${JAVA_PREFIX}/${f}`, `backend/${f}`))
        this._copyTpl('java/build.gradle', 'backend/build.gradle')
      } else {
        [ 'mvnw', 'mvnw.cmd', '.mvn/' ].forEach(f => this._copy(`${JAVA_PREFIX}/${f}`, `backend/${f}`))
        this._copyTpl('java/pom.xml', 'backend/pom.xml')
      }
    } else {
      this._copy(`${PYTHON_PREFIX}/logging.conf`, 'backend/resources/logging.conf')
      this._copyTpl('python/config.yaml', 'backend/resources/config.yaml');
      this._copy(`${PYTHON_PREFIX}/.gitignore.tpl`, 'backend/.gitignore')
      this._copy(`${PYTHON_PREFIX}/readme.md`, 'backend/readme.md')
      this._copyTpl('python/requirements.txt', 'backend/requirements.txt')
      this._copy('python/__main__.py', 'backend/src/__main__.py')
      this._copy('python/ext_app_be.py', 'backend/src/ext_app_be.py')
    }
  }

  _spawnNode() {
    if (this.runtimeIndex === this.runtimes.length) {
      this.log.error('Error: No node runtime found')
      return;
    }
    const { command, args } = this.runtimes[this.runtimeIndex]
    try {
      this.spawnCommandSync(command, args, { cwd: './web' })
      this.answers.runtime = command
    } catch (e) {
      this.runtimeIndex++
      this._spawnNode()
    }
  }

  _spawnJava(proc, arg) {
    try {
      this.log('Running '.green + `${proc} ${arg}`.white + ' in your project'.green)
      this.spawnCommandSync(proc, [ arg ], { cwd: './backend' })
      const launchArg = (proc.indexOf('gradle') > -1) ? 'bootRun' : 'spring-boot:run'
      this.answers.launchCommand = `${proc} ${launchArg}`
    } catch (e1) {
      this.log.error(e1)
      if (proc === 'gradle' || proc === 'mvn') {
        this.log('Unable to complete build process')
      } else {
        this._spawnJava(proc.indexOf('gradle') > -1 ? 'gradle' : 'mvn', arg)
      }
    }
  }

  install() {
    this.log()
    this.runtimes = [
      { command: 'bun', args: [ 'i' ] },
      { command: 'yarn', args: [] },
      { command: 'npm', args: [ 'i', '--no-fund' ] },
    ]
    this.runtimeIndex = 0;
    this._spawnNode()

    if (this.answers.bdk === 'Java') {
      if (this.answers.build === 'Maven') {
        this._spawnJava('./mvnw', 'package')
      } else {
        this._spawnJava('./gradlew', 'build')
      }
    } else {
      this.spawnCommandSync('python3', [ '-m', 'venv', 'env' ], { cwd: './backend' })
      this.spawnCommandSync('./env/bin/pip3', [ 'install', '-r', 'requirements.txt' ], { cwd: './backend' })
      this.answers.launchCommand = 'env/bin/python3 -m src'
    }
  }

  end() {
    const appName = (this.answers.appId === 'localhost-4000') ? 'Localhost 4000' : this.answers.appId
    this.log('\nYour Extension App + Identity project has been successfully generated!\n'.cyan)
    this.log('To launch your backend project, run: '.yellow + 'cd backend && ' + this.answers.launchCommand)
    this.log('To launch your frontend project, run: '.yellow + 'cd web && ' + this.answers.runtime + ' start')
    this.log('Then, visit '.yellow + 'https://localhost:4000/controller.html' + ' and dismiss the warning'.yellow)
    this.log('Finally, visit '.yellow + `https://${this.answers.host}` + ` and install the ${appName} app from Symphony Marketplace`.yellow)
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
