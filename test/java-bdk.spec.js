const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const path = require('path')
const fs = require('fs')
const {assertKeyPair} = require('./test-utils')

const BASE_JAVA = 'src/main/java'
const BASE_RESOURCE = 'src/main/resources'
const BASE_PACKAGE = 'com.mycompany.bot'
const PACKAGE_DIR = 'com/mycompany/bot'

const SMALL_KEY_PAIR_LENGTH = 512;

const axios = require("axios");
jest.mock('axios');

describe('Java BDK error scenarios', () => {
  const currentDir = process.cwd()

  afterAll(() => {
    process.chdir(currentDir);
    jest.resetAllMocks();
  })

  it('Java BDK default version should be used when maven search query fails', () => {
    axios.get.mockRejectedValueOnce({errno: -3008, code: 'ENOTFOUND'});

    return helpers.run(path.join(__dirname, '../generators/app'))
      .inTmpDir()
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
        groupId: 'com.mycompany',
        artifactId: 'bot-application',
        basePackage: BASE_PACKAGE
      }).then((dir) => {
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
    axios.get.mockResolvedValue({"data": {"response": {"docs": []}}});
    
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inTmpDir()
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
        groupId: 'com.mycompany',
        artifactId: 'bot-application',
        basePackage: BASE_PACKAGE
      }).then((dir) => {
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
  const currentDir = process.cwd()

  beforeAll(() => {
    axios.get.mockResolvedValue({"data": {"response": {"docs": [{"latestVersion": "2.3.0"}]}}});
  })

  afterAll(() => {
    process.chdir(currentDir);
    jest.resetAllMocks();
  })

  it('Generate 2.0 spring boot gradle', () => {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inTmpDir()
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
        groupId: 'com.mycompany',
        artifactId: 'bot-application',
        basePackage: BASE_PACKAGE
      })
      .then((dir) => {
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
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inTmpDir()
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withPrompts({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'bot-app',
        language: 'java',
        build: 'Gradle',
        framework: 'java',
        groupId: 'com.mycompany',
        artifactId: 'bot-application',
        basePackage: BASE_PACKAGE
      })
      .then((dir) => {
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

  it('Generate 2.0 spring boot maven', async () => {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withPrompts({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'bot-app',
        language: 'java',
        build: 'Maven',
        framework: 'spring',
        groupId: 'com.mycompany',
        artifactId: 'bot-application',
        basePackage: BASE_PACKAGE
      })
      .then((dir) => {
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
    return helpers.run(path.join(__dirname, '../generators/app'))
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withPrompts({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'bot-app',
        language: 'java',
        build: 'Maven',
        framework: 'java',
        groupId: 'com.mycompany',
        artifactId: 'bot-application',
        basePackage: BASE_PACKAGE
      })
      .then((dir) => {
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

  it('Generate 2.0 ext app maven', () => {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withPrompts({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'ext-app',
        language: 'java',
        build: 'Maven',
        framework: 'java',
        groupId: 'com.mycompany',
        artifactId: 'bot-application',
        basePackage: BASE_PACKAGE
      })
      .then((dir) => {
        assert.file([
          '.mvn/wrapper/maven-wrapper.properties',
          '.mvn/wrapper/MavenWrapperDownloader.java',
          'mvnw',
          'mvnw.cmd',
          'pom.xml',
          path.join(BASE_JAVA, PACKAGE_DIR, 'ExtensionAppApplication.java'),
          path.join(BASE_JAVA, PACKAGE_DIR, 'SecurityConfig.java'),
          'rsa/privatekey.pem',
          'rsa/publickey.pem',
          '.gitignore',
          path.join(BASE_RESOURCE, 'static/css/app.css'),
          path.join(BASE_RESOURCE, 'static/app.html'),
          path.join(BASE_RESOURCE, 'static/controller.html'),
          path.join(BASE_RESOURCE, 'static/scripts/controller.js'),
          path.join(BASE_RESOURCE, 'static/scripts/app.js'),
          path.join(BASE_RESOURCE, 'keystore.p12'),
          path.join(BASE_RESOURCE, 'application.yaml')
        ]);
        let privateKey = fs.readFileSync('rsa/privatekey.pem', 'utf-8')
        let generatedPublicKey = fs.readFileSync('rsa/publickey.pem', 'utf-8')
        assertKeyPair(privateKey, generatedPublicKey)
      })
  })

  it('Generate 2.0 ext app gradle', () => {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inTmpDir()
      .withLocalConfig({
        KEY_PAIR_LENGTH: SMALL_KEY_PAIR_LENGTH
      })
      .withPrompts({
        host: 'acme.symphony.com',
        username: 'test-bot',
        application: 'ext-app',
        language: 'java',
        build: 'Gradle',
        framework: 'java',
        groupId: 'com.mycompany',
        artifactId: 'bot-application',
        basePackage: BASE_PACKAGE
      })
      .then((dir) => {
        assert.file([
          'gradlew',
          'gradlew.bat',
          'build.gradle',
          path.join(BASE_JAVA, PACKAGE_DIR, 'ExtensionAppApplication.java'),
          path.join(BASE_JAVA, PACKAGE_DIR, 'SecurityConfig.java'),
          'rsa/privatekey.pem',
          'rsa/publickey.pem',
          '.gitignore',
          path.join(BASE_RESOURCE, 'static/css/app.css'),
          path.join(BASE_RESOURCE, 'static/app.html'),
          path.join(BASE_RESOURCE, 'static/controller.html'),
          path.join(BASE_RESOURCE, 'static/scripts/controller.js'),
          path.join(BASE_RESOURCE, 'static/scripts/app.js'),
          path.join(BASE_RESOURCE, 'keystore.p12'),
          path.join(BASE_RESOURCE, 'application.yaml')
        ]);
        let privateKey = fs.readFileSync('rsa/privatekey.pem', 'utf-8')
        let generatedPublicKey = fs.readFileSync('rsa/publickey.pem', 'utf-8')
        assertKeyPair(privateKey, generatedPublicKey)
      })
  })
})
