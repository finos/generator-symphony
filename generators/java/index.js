const Generator = require('yeoman-generator');
const keyPair = require('keypair');
const path = require('path');
const colors = require('colors');
const axios = require('axios');
const config = require('../lib/config');

const BASE_JAVA = 'src/main/java';
const BASE_RESOURCES = 'src/main/resources';
const DEFAULT_SDK_VERSION = '1.0.50'; // just in case if the search query failed
const MAVEN_SEARCH_QUERY = 'https://search.maven.org/solrsearch/select?q=g:com.symphony.platformsolutions+AND+a:symphony-api-client-java';

module.exports = class extends Generator {

    async initializing () {
        try {
            const res = await axios.get(MAVEN_SEARCH_QUERY);
            this.javaSdkVersion = res.data['response']['docs'][0]['latestVersion'];
        } catch (e) {
            this.log.error(`Oups, something went wrong when retrieving the latest SDK version from the Maven Central, falling back to ${DEFAULT_SDK_VERSION}`);
            this.javaSdkVersion = DEFAULT_SDK_VERSION;
        }
    }

    async prompting () {
        const questions = [
            {
                type: 'list',
                name: 'templateName',
                message: 'Which template do you want to start with',
                choices: [ 'java8', 'spring (available soon)', 'vetx (available soon)', 'quarkus (available soon)' ]
            },
            {
                type: 'input',
                name: 'basePackage',
                message: 'What is the base package for your classes',
                default: 'com.symphony.ps',
                validate: function(input) {
                    if (!/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+[0-9a-z_]$/gis.test(input)) {
                        return 'Please enter a valid package name'.red.bold + '        ^^'.white.bold;
                    }
                    return true;
                }
            }
        ];

        this.answers = await this.prompt(questions);

        // Java specific parameters
        this.answers.java = {
            sdkVersion: this.javaSdkVersion,

            mavenArtifactId: this.options.application_name,
            mavenGroupId: this.answers.basePackage,

            basePackage: this.answers.basePackage
        };

        // copy parent answers
        this.answers.applicationName = this.options.application_name;
        this.answers.subDomain = this.options.subdomain;
        this.answers.dirname = this.options.dirname;
        this.answers.botUsername = this.options.botusername;
        this.answers.botEmail = this.options.botemail;
        this.answers.encryptionType = this.options.encryption;
        this.answers.generateRsaKeys = this.options.generateRsaKeys;
    }

    /**
     * Idea for the future: using https://www.gitignore.io/api/java,maven?format=lines to generate the .gitignore file
     */
    writing () {

        this.doInstall = true;

        this.log('Generating your custom configuration file...'.green.bold);
        const configData = config.generateConfig(
            this.answers.subDomain,
            this.answers.botUsername,
            this.answers.botEmail,
            {
                botPrivateKeyPath: 'src/main/resources/rsa/',
                botPrivateKeyName: 'privatekey.pem'
            },
            null
        );
        this.fs.writeJSON(path.join(BASE_RESOURCES, 'config.json'), configData);

        if (this.answers.generateRsaKeys) {
            this.log('Generating RSA keys...'.green.bold);
            try {
                this.pair = keyPair(4096);
                this.fs.write(path.join(BASE_RESOURCES, 'rsa/publickey.pem'), this.pair.public, err => this.log.error(err));
                this.fs.write(path.join(BASE_RESOURCES, 'rsa/privatekey.pem'), this.pair.private, err => this.log.error(err));
            } catch (e) {
                this.log.error(`Oups, something went wrong when generation RSA key pair`, e);
            }
        }

        switch (this.answers.templateName) {
            case 'java8':
                this._generateJava8();
                break;
            default:
                this.doInstall = false;
                this.log(`Template ${this.answers.templateName} not available yet.`.bgYellow.black.bold);
        }
    }

    /**
     * Builds Maven project
     */
    install () {
        if(this.doInstall) {
            this.log('Running '.green.bold + './mvnw package'.white.bold + ' in your project'.green.bold);
            this.spawnCommandSync(path.join(this.destinationPath(), 'mvnw'), ['package']);
        }
    }

    /**
     * Final message, displays the RSA public key if possible
     */
    end () {
        if (this.pair) {
            this.log('\nYou can now update the service account '.cyan +
                `${this.answers.botUsername}`.white.bold +
                ` with the following public key on https://${this.answers.subDomain}.symphony.com/admin-console : `.cyan);

            this.log('\n' + this.pair.public);
        }

        this.log(`\nYour ${this.answers.templateName} has been successfully generated and compiled !`.cyan.bold);
    }

    _generateJava8 () {

        this.log('Generating Java project...'.green.bold);
        // copy regular files, that don't need to be processed
        ['mvnw', 'mvnw.cmd', '.mvn', '.gitignore', 'certificates', 'src/main/resources/log4j.properties'].forEach(file => {
            this.fs.copy(this.templatePath(file), this.destinationPath(file));
        });
        // process pom.xml
        this.fs.copyTpl(
            this.templatePath('pom.xml.ejs'),
            this.destinationPath('pom.xml'),
            this.answers
        );
        // process main class
        this.fs.copyTpl(
            this.templatePath(BASE_JAVA + '/BotApplication.java.ejs'),
            this.destinationPath(BASE_JAVA, this.answers.java.basePackage.split('.').join('/'), 'BotApplication.java'),
            this.answers
        );
    }
};