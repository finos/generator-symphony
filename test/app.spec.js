import helpers from 'yeoman-test';
import * as fs from 'fs';
import axios from 'axios'
import sinon from 'sinon'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { expect } from 'chai';

const SMALL_KEY_PAIR_LENGTH = 512;

const dir = dirname(dirname(fileURLToPath(import.meta.url)))

describe('Generator scenarios', () => {
  it('Directory is not empty', () => {
    sinon.stub(axios, 'get').rejects({errno: -3008, code: 'ENOTFOUND'})
    const consoleStub = sinon.stub(console, 'log').returns('a');

    return helpers.run(dir + '/generators/app')
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .doInDir((dir) => fs.mkdirSync(dir + '/abc'))
      .withAnswers({
        host: 'develop2.symphony.com',
        application: 'bot-app',
        username: 'test-bot',
        language: 'java',
        framework: 'spring',
        build: 'Gradle',
        artifactId: 'bot-application',
        basePackage: 'com.mycompany.bot'
      }).then(({ cwd }) => {
        expect(consoleStub.firstCall.args[0]).to.be.eq(`(!) Folder ${cwd} is not empty. Are you sure you want to continue?`.red)
      })
  })
})
