const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const path = require('path')
const axios = require('axios')
const fs = require('fs')
const forge = require('node-forge')

const MAVEN_SYMPHONY_SEARCH = "https://search.maven.org/solrsearch/select?q=g:com.symphony.platformsolutions+AND+a:symphony-bdk-bom";
const MAVEN_SPRING_BOOT_SEARCH = "https://search.maven.org/solrsearch/select?q=g:org.springframework.boot"
const BASE_JAVA = 'src/main/java'
const BASE_RESOURCE = 'src/main/resources'
const BASE_PACKAGE = 'com.mycompany.bot'
const PACKAGE_DIR = 'com/mycompany/bot'

axios.get.mockImplementation((url) => {
  if (url === MAVEN_SYMPHONY_SEARCH) {
    return Promise.resolve({
      data: {
        response: {
          docs: [
            {
              latestVersion: "1.3.2.BETA"
            }
          ]
        }
      }
    })
  } else if (url === MAVEN_SPRING_BOOT_SEARCH) {
    return Promise.resolve({
      data: {
        response: {
          docs: [
            {
              latestVersion: "2.3.4.RELEASE"
            }
          ]
        }
      }
    })
  }
})

it('Generate 2.0 spring boot gradle', () => {
  return helpers.run(path.join(__dirname, '../generators/bdk'))
    .inTmpDir()
    .withPrompts({
      host: 'acme.symphony.com',
      username: 'test-bot',
      language: 'Java (beta)',
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
        path.join('rsa/privatekey.pem'),
        path.join('rsa/publickey.pem'),
        path.join('.gitignore'),
        path.join(BASE_RESOURCE, 'templates/welcome.ftl'),
        path.join(BASE_RESOURCE, 'templates/gif.ftl'),
        path.join(BASE_RESOURCE, 'application.yaml')
      ]);
      let privateKey = fs.readFileSync(path.join(dir, 'rsa/privatekey.pem'), 'utf-8')
      let generatedPublicKey = fs.readFileSync(path.join(dir, 'rsa/publickey.pem'), 'utf-8')
      assertKeyPair(privateKey, generatedPublicKey)
    })
})

it('Generate 2.0 java gradle', () => {
  return helpers.run(path.join(__dirname, '../generators/bdk'))
    .inTmpDir()
    .withPrompts({
      host: 'acme.symphony.com',
      username: 'test-bot',
      language: 'Java (beta)',
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
        path.join('rsa/privatekey.pem'),
        path.join('rsa/publickey.pem'),
        path.join('.gitignore'),
        path.join(BASE_RESOURCE, 'templates/welcome.ftl'),
        path.join(BASE_RESOURCE, 'templates/gif.ftl'),
        path.join(BASE_RESOURCE, 'config.yaml')
      ]);
      let privateKey = fs.readFileSync(path.join(dir, 'rsa/privatekey.pem'), 'utf-8')
      let generatedPublicKey = fs.readFileSync(path.join(dir, 'rsa/publickey.pem'), 'utf-8')
      assertKeyPair(privateKey, generatedPublicKey)
    })
})

it('Generate 2.0 spring boot maven', async () => {
  return helpers.run(path.join(__dirname, '../generators/bdk'))
    .withPrompts({
      host: 'acme.symphony.com',
      username: 'test-bot',
      language: 'Java (beta)',
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
        path.join('rsa/privatekey.pem'),
        path.join('rsa/publickey.pem'),
        path.join('.gitignore'),
        path.join(BASE_RESOURCE, 'templates/welcome.ftl'),
        path.join(BASE_RESOURCE, 'templates/gif.ftl'),
        path.join(BASE_RESOURCE, 'application.yaml')
      ]);
      let privateKey = fs.readFileSync(path.join(dir, 'rsa/privatekey.pem'), 'utf-8')
      let generatedPublicKey = fs.readFileSync(path.join(dir, 'rsa/publickey.pem'), 'utf-8')
      assertKeyPair(privateKey, generatedPublicKey)
      
    })
})

it('Generate 2.0 java maven', () => {
  return helpers.run(path.join(__dirname, '../generators/bdk'))
    .withPrompts({
      host: 'acme.symphony.com',
      username: 'test-bot',
      language: 'Java (beta)',
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
        path.join('rsa/privatekey.pem'),
        path.join('rsa/publickey.pem'),
        path.join('.gitignore'),
        path.join(BASE_RESOURCE, 'templates/welcome.ftl'),
        path.join(BASE_RESOURCE, 'templates/gif.ftl'),
        path.join(BASE_RESOURCE, 'config.yaml')
      ]);
      let privateKey = fs.readFileSync(path.join(dir, 'rsa/privatekey.pem'), 'utf-8')
      let generatedPublicKey = fs.readFileSync(path.join(dir, 'rsa/publickey.pem'), 'utf-8')
      assertKeyPair(privateKey, generatedPublicKey)
    })
})

function assertKeyPair(generatedPrivateKey, generatedPublicKey) {
  let forgePrivateKey = forge.pki.privateKeyFromPem(generatedPrivateKey);
  let forgePublicKey = forge.pki.setRsaPublicKey(forgePrivateKey.n, forgePrivateKey.e);
  let publicKey = forge.pki.publicKeyToRSAPublicKeyPem(forgePublicKey).toString();
  assert.textEqual(generatedPublicKey.split("\n").join(""), publicKey.split("\r\n").join(""))
}