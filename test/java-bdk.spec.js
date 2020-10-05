const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const path = require('path')
const axios = require('axios');
const fs = require('fs')

const MAVEN_SYMPHONY_SEARCH = "https://search.maven.org/solrsearch/select?q=g:com.symphony.platformsolutions+AND+a:symphony-bdk-bom";
const MAVEN_SPRING_BOOT_SEARCH = "https://search.maven.org/solrsearch/select?q=g:org.springframework.boot"
const BASE_JAVA = 'src/main/java'
const BASE_RESOURCE = 'src/main/resources'
const BASE_PACKAGE = 'com.mycompany.bot'
const PACKAGE_DIR = 'com/mycompany/bot'

axios.get.mockImplementation((url) => {
    if (url === MAVEN_SYMPHONY_SEARCH) {
        return Promise.resolve({data: {
                response: {
                    docs: [
                        {
                            latestVersion: "1.2.2"
                        }
                    ]
                }
            }})
    } else if (url === MAVEN_SPRING_BOOT_SEARCH) {
        return Promise.resolve({data: {
                response: {
                    docs: [
                        {
                            latestVersion: "2.3.4.RELEASE"
                        }
                    ]
                }
            }})
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
                path.join(BASE_JAVA, PACKAGE_DIR, 'RealTimeEventsComponent.java'),
                path.join(BASE_RESOURCE, 'rsa/privatekey.pem'),
                path.join(BASE_RESOURCE, 'rsa/publickey.pem'),
                path.join(BASE_RESOURCE, 'templates/gif.ftl'),
                path.join(BASE_RESOURCE, 'application.yaml')
            ]);

            assert.fileContent(
                path.join(BASE_JAVA, PACKAGE_DIR, 'BotApplication.java'),
                fs.readFileSync(path.join(__dirname, 'test-content/bdk/java-spring/BotApplication.java'), 'utf-8')
            )

            assert.fileContent(
                path.join(BASE_JAVA, PACKAGE_DIR, 'GifFormActivity.java'),
                fs.readFileSync(path.join(__dirname, 'test-content/bdk/java-spring/GifFormActivity.java'), 'utf-8')
            )

            assert.fileContent(
                path.join(BASE_RESOURCE, 'application.yaml'),
                fs.readFileSync(path.join(__dirname, 'test-content/bdk/java-spring/application.yaml'), 'utf-8').replace('{tmpDir}', '/private' + dir)
            )

            assert.fileContent(
                path.join('build.gradle'),
                fs.readFileSync(path.join(__dirname, 'test-content/bdk/java-spring/build.gradle'), 'utf-8')
            )
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
                path.join(BASE_RESOURCE, 'rsa/privatekey.pem'),
                path.join(BASE_RESOURCE, 'rsa/publickey.pem'),
                path.join(BASE_RESOURCE, 'templates/gif.ftl'),
                path.join(BASE_RESOURCE, 'config.yaml')
            ]);

            assert.fileContent(
                path.join(BASE_JAVA, PACKAGE_DIR, 'BotApplication.java'),
                fs.readFileSync(path.join(__dirname, 'test-content/bdk/java-no-framework/BotApplication.java'), 'utf-8')
            )

            assert.fileContent(
                path.join(BASE_RESOURCE, 'config.yaml'),
                fs.readFileSync(path.join(__dirname, 'test-content/bdk/java-no-framework/config.yaml'), 'utf-8').replace('{tmpDir}', '/private' + dir)
            )

            assert.fileContent(
                path.join('build.gradle'),
                fs.readFileSync(path.join(__dirname, 'test-content/bdk/java-no-framework/build.gradle'), 'utf-8')
            )
        })
})

it('Generate 2.0 spring boot maven', () => {
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
        .then(() => {
            assert.file([
                '.mvn/wrapper/maven-wrapper.properties',
                '.mvn/wrapper/MavenWrapperDownloader.java',
                'mvnw',
                'mvnw.cmd',
                'pom.xml',
                path.join(BASE_JAVA, PACKAGE_DIR, 'BotApplication.java'),
                path.join(BASE_JAVA, PACKAGE_DIR, 'GifFormActivity.java'),
                path.join(BASE_JAVA, PACKAGE_DIR, 'RealTimeEventsComponent.java'),
                path.join(BASE_RESOURCE, 'rsa/privatekey.pem'),
                path.join(BASE_RESOURCE, 'rsa/publickey.pem'),
                path.join(BASE_RESOURCE, 'templates/gif.ftl'),
                path.join(BASE_RESOURCE, 'application.yaml')
            ]);

            assert.fileContent(
                path.join('pom.xml'),
                fs.readFileSync(path.join(__dirname, 'test-content/bdk/java-spring/pom.xml'), 'utf-8')
            )
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
        .then(() => {
            assert.file([
                '.mvn/wrapper/maven-wrapper.properties',
                '.mvn/wrapper/MavenWrapperDownloader.java',
                'mvnw',
                'mvnw.cmd',
                'pom.xml',
                path.join(BASE_JAVA, PACKAGE_DIR, 'BotApplication.java'),
                path.join(BASE_RESOURCE, 'rsa/privatekey.pem'),
                path.join(BASE_RESOURCE, 'rsa/publickey.pem'),
                path.join(BASE_RESOURCE, 'templates/gif.ftl'),
                path.join(BASE_RESOURCE, 'config.yaml')
            ]);

            assert.fileContent(
                path.join('pom.xml'),
                fs.readFileSync(path.join(__dirname, 'test-content/bdk/java-no-framework/pom.xml'), 'utf-8')
            )
        })
})