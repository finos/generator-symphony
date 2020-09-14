const Generator = require('yeoman-generator');
const colors = require('colors');
const path = require('path');
const keyPair = require('keypair');
const axios = require('axios')

const BASE_JAVA = 'src/main/java';
const BASE_RESOURCES = 'src/main/resources';

const BDK_VERSION_DEFAULT = '1.2.1.BETA';
const MAVEN_SEARCH_BASE = 'https://search.maven.org/solrsearch/select?q=g:com.symphony.platformsolutions+AND+a:';

module.exports = class extends Generator {

    initializing () {

    }

    async prompting () {
        this.answers = await this.prompt([
            {
                type: 'list',
                name: 'build',
                message: 'Select your build system',
                choices: [
                    'Maven',
                    'Gradle',
                ]
            },
            // {
            //     type: 'list',
            //     name: 'framework',
            //     message: 'Select your framework',
            //     choices: [
            //         'Java (no framework)',
            //         'SpringBoot (experimental)'
            //     ]
            // },
            {
                type: 'input',
                name: 'groupId',
                message: 'Enter your project groupId',
                default: 'com.mycompany'
            },
            {
                type: 'input',
                name: 'artifactId',
                message: 'Enter your project artifactId',
                default: 'bot-application'
            },
            {
                type: 'input',
                name: 'basePackage',
                message: 'Enter your base package',
                default: 'com.mycompany.bot'
            }
        ]);
    }

    async writing () {

        // copy input options as answers to be used in templates
        this.answers.host = this.options.host;
        this.answers.username = this.options.username;

        // get latest BDK BOM version
        try {
            const mavenResponse = await axios.get(MAVEN_SEARCH_BASE + 'symphony-bdk-bom');
            this.answers.bdkBomVersion = mavenResponse.data['response']['docs'][0]['latestVersion'];
            this.log('Latest BDK version is '.green.bold + `${this.answers.bdkBomVersion}`.white.bold);
        } catch (error) {
            this.log(`\u26A0 Cannot retrieve latest BDK version from Maven Central. Default: ${BDK_VERSION_DEFAULT}`.grey);
            this.answers.bdkBomVersion = BDK_VERSION_DEFAULT;
        }

        // Process build files
        if (this.answers.build === 'Gradle') {
            this._processGradleFiles()
        } else {
            this._processMavenFiles()
        }

        try {
            this.log('Generating RSA keys...'.green.bold);
            this.pair = keyPair(4096);
            this.fs.write(path.join(BASE_RESOURCES, 'rsa/publickey.pem'), this.pair.public, err => this.log.error(err));
            this.fs.write(path.join(BASE_RESOURCES, 'rsa/privatekey.pem'), this.pair.private, err => this.log.error(err));
            this.answers.privateKeyPath = path.join(this.destinationPath(), BASE_RESOURCES, 'rsa/privatekey.pem');
        } catch (e) {
            this.log.error(`Oups, something went wrong when generating RSA key pair`, e);
        }

        // process and copy config.yaml file
        this.fs.copyTpl(
            this.templatePath('config.yaml.ejs'),
            this.destinationPath(path.join(BASE_RESOURCES, 'config.yaml')),
            this.answers
        );

        // process and copy BotApplication.java class
        this.fs.copyTpl(
            this.templatePath(path.join(BASE_JAVA, 'BotApplication.java.ejs')),
            this.destinationPath(path.join(BASE_JAVA, this.answers.basePackage.split('.').join('/'), 'BotApplication.java')),
            this.answers
        );
    }

    /**
     * Build Maven or Gradle project
     */
    install () {
        if (this.answers.build === 'Maven') {
            this.log('Running '.green.bold + './mvnw package'.white.bold + ' in your project'.green.bold);
            this.spawnCommandSync(path.join(this.destinationPath(), 'mvnw'), ['package']);
        } else {
            this.log('Running '.green.bold + './gradlew build'.white.bold + ' in your project'.green.bold);
            this.spawnCommandSync(path.join(this.destinationPath(), 'gradlew'), ['build']);
        }
    }

    end () {
        if (this.pair) {
            this.log('\nYou can now update the service account '.cyan +
                `${this.answers.username}`.white.bold +
                ` with the following public key on https://${this.answers.host}/admin-console : `.cyan);

            this.log('\n' + this.pair.public);
        }

        this.log(`Your Java project has been successfully generated !`.cyan.bold);
    }

    _processGradleFiles() {
        this.fs.copyTpl(
            this.templatePath('gradlew'),
            this.destinationPath('gradlew')
        );

        this.fs.copyTpl(
            this.templatePath('gradlew.bat'),
            this.destinationPath('gradlew.bat')
        );

        this.fs.copyTpl(
            this.templatePath('gradle/'),
            this.destinationPath('gradle/')
        );

        this.fs.copyTpl(
            this.templatePath('build.gradle.ejs'),
            this.destinationPath('build.gradle'),
            this.answers
        );
    }

    _processMavenFiles() {
        this.fs.copyTpl(
            this.templatePath('mvnw'),
            this.destinationPath('mvnw')
        );

        this.fs.copyTpl(
            this.templatePath('mvnw.cmd'),
            this.destinationPath('mvnw.cmd')
        );

        this.fs.copyTpl(
            this.templatePath('.mvn/'),
            this.destinationPath('.mvn/')
        );

        this.fs.copyTpl(
            this.templatePath('pom.xml.ejs'),
            this.destinationPath('pom.xml'),
            this.answers
        );
    }
}