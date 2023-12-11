import Generator from 'yeoman-generator'
import colors from 'colors'
import fs from 'fs'
import { createRequire } from 'node:module';
import java from '../java/index.js'
import python from '../python/index.js'
import extApp from '../ext-app/index.js'
import extAppBdk from '../ext-app-bdk/index.js'
import workflow from '../workflow/index.js'

export default class extends Generator {
  constructor(args, opts) {
    super(args, opts, { customInstallTask: true })
  }

  initializing() {
    const packageJson = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url)))

    this.log(` __   __     ___                 _
 \\ \\ / /__  / __|_  _ _ __  _ __| |_  ___ _ _ _  _
  \\ V / _ \\ \\__ \\ || | '  \\| '_ \\ ' \\/ _ \\ ' \\ || |
   |_|\\___/ |___/\\_, |_|_|_| .__/_||_\\___/_||_\\_, |
                 |__/      |_|                |__/ `.blue)
    this.log('\thttps://developers.symphony.com\n')
    this.log('Welcome to Symphony Generator '.gray + `v${packageJson.version}`.yellow)
    this.log('Project files will be generated in folder: '.gray + `${this.destinationRoot()}`.yellow)
    this.log('______________________________________________________________________________________________________'.yellow)

    try {
      const folderFiles = fs.readdirSync(this.destinationRoot())
      if (folderFiles.length > 0) {
        console.log(`(!) Folder ${this.destinationRoot()} is not empty. Are you sure you want to continue?`.red)
      }
    } catch(e) {
      this.log(e)
    }
  }

  async prompting() {
    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'host',
        message: 'Enter your pod host',
        default: 'develop2.symphony.com'
      },
      {
        type: 'list',
        name: 'application',
        message: 'Select your project type',
        choices: [
          {
            name: 'Bot (BDK)',
            value: 'bot-app'
          },
          {
            name: 'Workflow (WDK)',
            value: 'workflow'
          },
          {
            name: 'Extension App (ADK)',
            value: 'ext-app'
          },
          {
            name: 'Extension App + Circle of Trust (ADK + BDK)',
            value: 'ext-app-bdk'
          },
        ]
      },
      {
        type: 'input',
        name: 'username',
        message: 'Enter your bot username',
        default: 'my-bot',
        when: answer => answer.application.indexOf('ext-app') === -1
      },
      {
        type: 'list',
        name: 'language',
        message: 'Select your programing language',
        choices: [
          {
            name: 'Java',
            value: 'java'
          },
          {
            name: 'Python',
            value: 'python'
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
            name: 'Spring Boot',
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
        when: answer => answer.application === 'ext-app' || (answer.application === 'ext-app-bdk' && answer.host !== 'develop2.symphony.com')
      }
    ])

    if (this.answers.language === 'java') {
      this._compose(java, '../java')
    } else if (this.answers.language === 'python') {
      this._compose(python, '../python')
    } else if (this.answers.application === 'workflow') {
      this._compose(workflow, '../workflow')
    } else if (this.answers.application === 'ext-app') {
      this._compose(extApp, '../ext-app')
    } else if (this.answers.application === 'ext-app-bdk') {
      this._compose(extAppBdk, '../ext-app-bdk')
    }
  }

  _compose(fn, path) {
    const require = createRequire(import.meta.url)
    return this.composeWith({
      Generator: fn,
      path: require.resolve(path)
    }, this.answers)
  }
}
