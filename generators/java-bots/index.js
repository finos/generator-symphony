const Generator = require('yeoman-generator');
const axios = require("axios");
const certificateCreator = require('../lib/p12-certificate-creator');
const RSAcertificateCreator = require('../lib/certificate-creator');
var mkdirp = require('mkdirp');

module.exports = class extends Generator {
    prompting() {
        return this.prompt([
            {
                type: 'list',
                name: 'java_bot_tpl',
                message: 'Which template do you want to start with',
                choices: ['Request/Reply', 'NLP Based Trade Workflow']
            }
        ]).then((answers) => {
            answers.application_name = this.options.initPrompts.application_name;
            answers.subdomain = this.options.initPrompts.subdomain;
            answers.dirname = this.options.initPrompts.dirname;
            answers.botusername = this.options.initPrompts.botusername;
            answers.botemail = this.options.initPrompts.botemail;
            answers.encryption = this.options.initPrompts.encryption;
            let log_text = ('* Generating ' +
                this.options.initPrompts.application_type.italic +
                ' ' +
                this.options.initPrompts.application_lang.italic +
                ' code from ' +
                answers.java_bot_tpl.italic + ' template...').bold;
            console.log(log_text.bgRed.white);

            if (answers.encryption.startsWith('RSA')) {
                answers.authType = 'rsa';
                answers.botCertPath = '';
                answers.botCertName = '';
                answers.botCertPassword = '';
                answers.botRSAPath = 'rsa/';
                answers.botRSAName = 'rsa-private-' + answers.botusername + '.pem';
            } else if (answers.encryption === 'Self Signed Certificate') {
                answers.authType = 'cert';
                answers.botCertPath = 'certificates/';
                answers.botCertName = answers.botusername;
                answers.botCertPassword = 'changeit';
                answers.botRSAPath = '';
                answers.botRSAName = '';
            } else {
                answers.authType = 'cert';
                answers.botCertPath = '';
                answers.botCertName = '';
                answers.botCertPassword = '';
                answers.botRSAPath = '';
                answers.botRSAName = '';
            }

            let mavenSearchUrlRoot = 'https://search.maven.org/solrsearch/select?q=g:com.symphony.platformsolutions+AND+a:';

            (async () => {
                if (answers.java_bot_tpl === 'Request/Reply') {
                    this.log('Looking for latest version of Java client library..');
                    const javaClientLibResponse = await axios.get(mavenSearchUrlRoot + 'symphony-api-client-java');
                    answers.java_client_library_version = javaClientLibResponse.data['response']['docs'][0]['latestVersion'];
                    this.log('Latest version of Java client library is', answers.java_client_library_version);

                    this.fs.copyTpl(
                        this.templatePath('java/bots/request-reply/pom.xml'),
                        this.destinationPath('pom.xml'),
                        answers
                    );
                    this.fs.copy(
                        this.templatePath('java/bots/request-reply/src'),
                        this.destinationPath('src')
                    );
                    this.fs.copyTpl(
                        this.templatePath('java/bots/request-reply/config.json'),
                        this.destinationPath('src/main/resources/config.json'),
                        answers
                    );
                    this.fs.copy(
                        this.templatePath('java/bots/request-reply/certificates'),
                        this.destinationPath('certificates'),
                        answers
                    );
                } else if (answers.java_bot_tpl === 'NLP Based Trade Workflow') {
                    this.log('Looking for latest version of Camunda library..');
                    const camundaLibResponse = await axios.get(mavenSearchUrlRoot + 'symphony-camunda-client');
                    answers.camunda_library_version = camundaLibResponse.data['response']['docs'][0]['latestVersion'];
                    this.log('Latest version of Camunda library is', answers.camunda_library_version);

                    this.log('Looking for latest version of NLP library..');
                    const nlpLibResponse = await axios.get(mavenSearchUrlRoot + 'symphony-opennlp-java');
                    answers.nlp_library_version = nlpLibResponse.data['response']['docs'][0]['latestVersion'];
                    this.log('Latest version of NLP library is', answers.nlp_library_version);

                    this.fs.copyTpl(
                        this.templatePath('java/bots/camunda-opennlp/pom.xml'),
                        this.destinationPath('pom.xml'),
                        answers
                    );
                    this.fs.copy(
                        this.templatePath('java/bots/camunda-opennlp/src'),
                        this.destinationPath('src')
                    );
                    this.fs.copyTpl(
                        this.templatePath('java/bots/request-reply/config.json'),
                        this.destinationPath('src/main/resources/config.json'),
                        answers
                    );
                    this.fs.copy(
                        this.templatePath('java/bots/camunda-opennlp/certificates'),
                        this.destinationPath('certificates')
                    );
                    this.fs.copyTpl(
                        this.templatePath('java/bots/camunda-opennlp/src/main/resources/nlp-config.json'),
                        this.destinationPath('src/main/resources/nlp-config.json'),
                        answers
                    );
                    this.fs.copy(
                        this.templatePath('java/bots/camunda-opennlp/bpmn'),
                        this.destinationPath('bpmn')
                    );
                }

                /* Install certificate */
                console.log('generating from template ' + answers.java_bot_tpl);
                if (answers.encryption === 'Self Signed Certificate') {
                    let log_text_cert = ('* Generating certificate for BOT ' + answers.botusername + '...').bold;
                    console.log(log_text_cert.bgRed.white);
                    certificateCreator.create(answers.botusername, 'certificates');
                } else if (answers.encryption === 'RSA - Generate New Keys') {
                    let log_text_cert = ('* Generating RSA public/private keys for BOT ' + answers.botusername + '...').bold;
                    console.log(log_text_cert.bgRed.white);
                    mkdirp.sync('rsa');
                    RSAcertificateCreator.createRSA(answers.botusername, 'rsa');
                    if (answers.java_bot_tpl === 'Request/Reply') {
                        this.fs.copy(
                            this.templatePath('java/bots/request-reply/main-class-rsa/RequestReplyBot.java'),
                            this.destinationPath('src/main/java/RequestReplyBot.java')
                        );
                    } else {
                        this.fs.copy(
                            this.templatePath('java/bots/camunda-opennlp/main-class-rsa/NLPBot.java'),
                            this.destinationPath('src/main/java/NLPBot.java')
                        );
                    }

                }

                let log_text_completion = ('* BOT generated successfully!!').bold;
                console.log(log_text_completion.bgGreen.white);
            })();
        });
    }
};
