const Generator = require('yeoman-generator')
const { getAdkVersion } = require('../_lib/util')

module.exports = class extends Generator {
  async prompting() {
    this.answers = await this.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Select your application type',
        choices: [
          'Basic',
          'App View',
          'Message Renderer',
        ]
      },
      {
        type: 'list',
        name: 'script',
        message: 'Select your language',
        choices: [
          'JavaScript',
          'TypeScript',
        ],
        when: answer => answer.type === 'App View'
      },
    ])

    this.log()
    this.answers = {
      ...this.options,
      ...this.answers,
      adkVersion: await getAdkVersion(),
    }
  }

  async writing() {
    this.log(`Using ADK Version: ${this.answers.adkVersion}`)

    // Basic or Message Renderer projects
    if ([ 'Basic', 'Message Renderer' ].indexOf(this.answers.type) > -1) {
      const indexFile = (this.answers.type === 'Basic') ? 'basic' : 'renderer'
      this._copyTpl('bundle.json')
      this._copy('basic/webpack.config.js', 'webpack.config.js')
      this._copyTpl('basic/package.json', 'package.json')
      this._copyTpl(`basic/${indexFile}.js`, 'src/index.js')
      return;
    }

    // App view projects
    if (this.answers.script === 'JavaScript') {
      const prefix = 'app-view/javascript'
      this._copy(`${prefix}/webpack.config.js`, 'webpack.config.js')
      this._copy(`${prefix}/.babelrc`, '.babelrc')
      this._copyTpl(`${prefix}/package.json`, 'package.json')
      this._copyTpl(`${prefix}/index.js`, 'src/index.js')
      this._copyTpl(`${prefix}/view-abc.jsx`, 'src/views/view-abc.jsx')
    } else {
      const prefix = 'app-view/typescript'
      this._copy(`${prefix}/webpack.config.js`, 'webpack.config.js')
      this._copy(`${prefix}/tsconfig.json`, 'tsconfig.json')
      this._copyTpl(`${prefix}/package.json`, 'package.json')
      this._copyTpl(`${prefix}/index.ts`, 'src/index.ts')
      this._copy(`${prefix}/types.ts`, 'src/types.ts')
      this._copyTpl(`${prefix}/view-abc.tsx`, 'src/views/view-abc.tsx')
    }
    this._copy('app-view/view-abc.css', 'src/views/view-abc.css')
    this._copyTpl('bundle.json')
  }

  _spawn() {
    if (this.runtimeIndex === this.runtimes.length) {
      this.log.error('Error: No node runtime found')
      return;
    }
    const { command, args } = this.runtimes[this.runtimeIndex]
    try {
      this.spawnCommandSync(command, args)
      this.answers.runtime = command
    } catch (e) {
      this.runtimeIndex++
      this._spawn()
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
    this._spawn()
  }

  end() {
    this.log('\nYour Extension App project has been successfully generated!\n'.cyan)
    this.log('To launch your project, first run: '.yellow + this.answers.runtime + ' start')
    this.log('Then, visit '.yellow + 'https://localhost:4000/controller.html' + ' and dismiss the warning'.yellow)
    this.log('Finally, visit '.yellow + `https://${this.answers.host}/?bundle=https://localhost:4000/bundle.json`)
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
