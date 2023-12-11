import helpers from 'yeoman-test'
import assert from 'yeoman-assert'
import path from 'path'
import fs from 'fs'
import axios from 'axios'
import { getGenerator, assertKeyPair } from './test-utils.js'
import sinon from 'sinon'

const BASE_JAVA = 'src/main/java'
const BASE_RESOURCE = 'src/main/resources'
const BASE_PACKAGE = 'com.mycompany.bot'
const PACKAGE_DIR = 'com/mycompany/bot'

const SMALL_KEY_PAIR_LENGTH = 512

describe('Java BDK error scenarios', () => {
  beforeEach(sinon.restore)
  afterEach(sinon.restore)

  it('Java BDK default version should be used when maven search query fails', () => {
    sinon.stub(axios, 'get').rejects({errno: -3008, code: 'ENOTFOUND'})

    return helpers.run(getGenerator())
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withAnswers({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'bot-app',
        language: 'java',
        build: 'Gradle',
        framework: 'spring',
        artifactId: 'bot-application',
        basePackage: BASE_PACKAGE
      }).then(() => {
        assert.file([
          'gradlew',
          'gradlew.bat',
          'build.gradle',
          path.join(BASE_JAVA, PACKAGE_DIR, 'BotApplication.java'),
          path.join(BASE_JAVA, PACKAGE_DIR, 'GifFormActivity.java'),
          path.join(BASE_JAVA, PACKAGE_DIR, 'OnUserJoinedRoomListener.java'),
          path.join(BASE_JAVA, PACKAGE_DIR, 'GifSlashHandler.java'),
          'rsa/privatekey.pem',
          'rsa/publickey.pem',
          '.gitignore',
          path.join(BASE_RESOURCE, 'templates/welcome.ftl'),
          path.join(BASE_RESOURCE, 'templates/gif.ftl'),
          path.join(BASE_RESOURCE, 'application.yaml')
        ]);
        let privateKey = fs.readFileSync('rsa/privatekey.pem', 'utf-8')
        let generatedPublicKey = fs.readFileSync('rsa/publickey.pem', 'utf-8')
        assertKeyPair(privateKey, generatedPublicKey)
      })
  })

  it('Java BDK default version should be used when maven search does not return latest version', () => {
    sinon.stub(axios, 'get').resolves({"data": {"response": {"docs": []}}})

    return helpers.run(getGenerator())
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withAnswers({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'bot-app',
        language: 'java',
        build: 'Gradle',
        framework: 'spring',
        artifactId: 'bot-application',
        basePackage: BASE_PACKAGE
      }).then(() => {
        assert.file([
          'gradlew',
          'gradlew.bat',
          'build.gradle',
          path.join(BASE_JAVA, PACKAGE_DIR, 'BotApplication.java'),
          path.join(BASE_JAVA, PACKAGE_DIR, 'GifFormActivity.java'),
          path.join(BASE_JAVA, PACKAGE_DIR, 'OnUserJoinedRoomListener.java'),
          path.join(BASE_JAVA, PACKAGE_DIR, 'GifSlashHandler.java'),
          'rsa/privatekey.pem',
          'rsa/publickey.pem',
          '.gitignore',
          path.join(BASE_RESOURCE, 'templates/welcome.ftl'),
          path.join(BASE_RESOURCE, 'templates/gif.ftl'),
          path.join(BASE_RESOURCE, 'application.yaml')
        ]);
        let privateKey = fs.readFileSync('rsa/privatekey.pem', 'utf-8')
        let generatedPublicKey = fs.readFileSync('rsa/publickey.pem', 'utf-8')
        assertKeyPair(privateKey, generatedPublicKey)
      })
  })
})

describe('Java BDK', () => {
  before(() =>
    sinon.stub(axios, 'get').resolves({"data": {"response": {"docs": [{"id": "2.3.0", "v": "2.3.0"}]}}})
  )

  after(sinon.restore)

  it('Generate 2.0 spring boot gradle', () => {
    return helpers.run(getGenerator())
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withAnswers({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'bot-app',
        language: 'java',
        build: 'Gradle',
        framework: 'spring',
        artifactId: 'bot-application',
        basePackage: BASE_PACKAGE
      })
      .then(() => {
        assert.file([
          'gradlew',
          'gradlew.bat',
          'build.gradle',
          path.join(BASE_JAVA, PACKAGE_DIR, 'BotApplication.java'),
          path.join(BASE_JAVA, PACKAGE_DIR, 'GifFormActivity.java'),
          path.join(BASE_JAVA, PACKAGE_DIR, 'OnUserJoinedRoomListener.java'),
          path.join(BASE_JAVA, PACKAGE_DIR, 'GifSlashHandler.java'),
          'rsa/privatekey.pem',
          'rsa/publickey.pem',
          '.gitignore',
          path.join(BASE_RESOURCE, 'templates/welcome.ftl'),
          path.join(BASE_RESOURCE, 'templates/gif.ftl'),
          path.join(BASE_RESOURCE, 'application.yaml')
        ]);
        let privateKey = fs.readFileSync('rsa/privatekey.pem', 'utf-8')
        let generatedPublicKey = fs.readFileSync('rsa/publickey.pem', 'utf-8')
        assertKeyPair(privateKey, generatedPublicKey)
      })
  })

  it('Generate 2.0 java gradle', () => {
    return helpers.run(getGenerator())
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withAnswers({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'bot-app',
        language: 'java',
        build: 'Gradle',
        framework: 'java',
        artifactId: 'bot-application',
        basePackage: BASE_PACKAGE
      })
      .then(() => {
        assert.file([
          'gradlew',
          'gradlew.bat',
          'build.gradle',
          path.join(BASE_JAVA, PACKAGE_DIR, 'BotApplication.java'),
          'rsa/privatekey.pem',
          'rsa/publickey.pem',
          '.gitignore',
          path.join(BASE_RESOURCE, 'templates/welcome.ftl'),
          path.join(BASE_RESOURCE, 'templates/gif.ftl'),
          path.join(BASE_RESOURCE, 'config.yaml')
        ]);
        let privateKey = fs.readFileSync('rsa/privatekey.pem', 'utf-8')
        let generatedPublicKey = fs.readFileSync('rsa/publickey.pem', 'utf-8')
        assertKeyPair(privateKey, generatedPublicKey)
      })
  })

  it('Generate 2.0 java gradle sandbox', () => {
    return helpers.run(getGenerator())
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withAnswers({
        host: 'develop2.symphony.com',
        username: 'test-bot',
        application: 'bot-app',
        language: 'java',
        build: 'Gradle',
        framework: 'java',
        artifactId: 'bot-application',
        basePackage: BASE_PACKAGE
      })
      .then(() => {
        assert.file([
          'gradlew',
          'gradlew.bat',
          'build.gradle',
          path.join(BASE_JAVA, PACKAGE_DIR, 'BotApplication.java'),
          '.gitignore',
          path.join(BASE_RESOURCE, 'templates/welcome.ftl'),
          path.join(BASE_RESOURCE, 'templates/gif.ftl'),
          path.join(BASE_RESOURCE, 'config.yaml')
        ]);
      })
  })

  it('Generate 2.0 spring boot maven', async () => {
    return helpers.run(getGenerator())
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withAnswers({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'bot-app',
        language: 'java',
        build: 'Maven',
        framework: 'spring',
        artifactId: 'bot-application',
        basePackage: BASE_PACKAGE
      })
      .then(() => {
        assert.file([
          '.mvn/wrapper/maven-wrapper.properties',
          '.mvn/wrapper/MavenWrapperDownloader.java',
          'mvnw',
          'mvnw.cmd',
          'pom.xml',
          path.join(BASE_JAVA, PACKAGE_DIR, 'BotApplication.java'),
          path.join(BASE_JAVA, PACKAGE_DIR, 'GifFormActivity.java'),
          path.join(BASE_JAVA, PACKAGE_DIR, 'OnUserJoinedRoomListener.java'),
          path.join(BASE_JAVA, PACKAGE_DIR, 'GifSlashHandler.java'),
          'rsa/privatekey.pem',
          'rsa/publickey.pem',
          '.gitignore',
          path.join(BASE_RESOURCE, 'templates/welcome.ftl'),
          path.join(BASE_RESOURCE, 'templates/gif.ftl'),
          path.join(BASE_RESOURCE, 'application.yaml')
        ]);
        let privateKey = fs.readFileSync('rsa/privatekey.pem', 'utf-8')
        let generatedPublicKey = fs.readFileSync('rsa/publickey.pem', 'utf-8')
        assertKeyPair(privateKey, generatedPublicKey)
      })
  })

  it('Generate 2.0 java maven', () => {
    return helpers.run(getGenerator())
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withAnswers({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'bot-app',
        language: 'java',
        build: 'Maven',
        framework: 'java',
        artifactId: 'bot-application',
        basePackage: BASE_PACKAGE
      })
      .then(() => {
        assert.file([
          '.mvn/wrapper/maven-wrapper.properties',
          '.mvn/wrapper/MavenWrapperDownloader.java',
          'mvnw',
          'mvnw.cmd',
          'pom.xml',
          path.join(BASE_JAVA, PACKAGE_DIR, 'BotApplication.java'),
          'rsa/privatekey.pem',
          'rsa/publickey.pem',
          '.gitignore',
          path.join(BASE_RESOURCE, 'templates/welcome.ftl'),
          path.join(BASE_RESOURCE, 'templates/gif.ftl'),
          path.join(BASE_RESOURCE, 'config.yaml')
        ]);
        let privateKey = fs.readFileSync('rsa/privatekey.pem', 'utf-8')
        let generatedPublicKey = fs.readFileSync('rsa/publickey.pem', 'utf-8')
        assertKeyPair(privateKey, generatedPublicKey)
      })
  })
})
