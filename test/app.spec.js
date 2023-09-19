const helpers = require('yeoman-test')
const path = require('path')
const fs = require('fs')

const SMALL_KEY_PAIR_LENGTH = 512;

const axios = require("axios");
jest.mock('axios');

describe('Generator scenarios', () => {
  const currentDir = process.cwd()

  afterAll(() => {
    process.chdir(currentDir);
  })

  it('Directory is not empty', () => {
    const logSpy = jest.spyOn(console, 'log');
    axios.mockRejectedValueOnce({errno: -3008, code: 'ENOTFOUND'});
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inTmpDir()
      .doInDir((dir) => fs.mkdirSync(dir + '/abc'))
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withPrompts({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'bot-app',
        language: 'java',
        build: 'Gradle',
        framework: 'spring',
        artifactId: 'bot-application',
        basePackage: 'com.mycompany.bot'
      }).then(({ cwd }) => {
        expect(logSpy).toHaveBeenCalledWith(`(!) Folder ${cwd} is not empty. Are you sure you want to continue?`.red);
      })
  })
})
