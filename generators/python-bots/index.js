const Generator = require('yeoman-generator');
const CertificateCreator = require('../lib/certificate-creator');

const REQUEST_REPLY = 'Request/Reply';
const ELEMENTS_FORM = 'Elements Form';

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        this.answers = {};
        this._fillWithInitPrompts(opts.initPrompts);

        this.baseTemplatePath = '';
    }

    prompting() {
        return this.prompt([
            {
                type: 'list',
                name: 'pythonBotTemplate',
                message: 'Which template do you want to start with',
                choices: [REQUEST_REPLY, ELEMENTS_FORM]
            }
        ]).then((answers) => {
            this._updateWithBotTemplateAnswer(answers);

            this._logAnswers();

            this._copyTemplateFiles();

            /* Install certificate */
            CertificateCreator.create(this.answers.encryption, this.answers.botusername, this.answers.botemail);
        }).then(() => {
            let logTextCompletion = ('* BOT generated successfully!!').bold;
            console.log(logTextCompletion.bgGreen.white);
        });
    }

    // Private methods are prepended with '_' to prevent yeoman from executing them
    // yeoman's behavior is to execute every method in a generator which does not begin with _
    _updateWithBotTemplateAnswer(answers) {
        Object.assign(this.answers, answers);

        switch(this.answers.pythonBotTemplate) {
            case(REQUEST_REPLY):
                this.baseTemplatePath = 'python/bots/request-reply/';
                break;
            case(ELEMENTS_FORM):
                this.baseTemplatePath = 'python/bots/elements_form/';
                break;
            default:
                this.baseTemplatePath = '';
                break;
        }
    }

    _fillWithInitPrompts(initPrompts) {
        Object.assign(this.answers, initPrompts);

        this.answers.botCertPath = '';
        this.answers.botCertName = '';
        this.answers.botCertPassword = '';
        this.answers.botRSAPath = '';
        this.answers.botRSAName = '';
        if (this.answers.encryption.startsWith('RSA')) {
            this.answers.authType = 'rsa';
            this.answers.botRSAPath = '../rsa/';
            this.answers.botRSAName = 'rsa-private-' + this.answers.botusername + '.pem';
        } else if (this.answers.encryption === 'Self Signed Certificate') {
            this.answers.authType = 'cert';
            this.answers.botCertPath = '../certificates/';
            this.answers.botCertName = this.answers.botusername;
            this.answers.botCertPassword = 'changeit';
        }
    }

    _logAnswers() {
        let log_text = ('* Generating ' + this.answers.application_type.italic + ' ' +
            this.answers.application_lang.italic + ' code from ' + this.answers.pythonBotTemplate.italic + ' template...');
        console.log(log_text.bold.bgRed.white);
        console.log(this.answers.encryption);
    }

    _copyTemplateFiles() {
        this._copyConfigFile();

        this._getSourceDestinationFilesMap().forEach((destinationFile, sourceFile) => {
            this.fs.copy(this.templatePath(sourceFile), this.destinationPath(destinationFile));
        })
    }

    _copyConfigFile() {
        this.fs.copyTpl(
            this.templatePath(this.baseTemplatePath + 'config.json'),
            this.destinationPath('resources/config.json'),
            this.answers
        );
    }

    _getSourceDestinationFilesMap() {
        let templateFilesToDestination = new Map();

        if (this.answers.pythonBotTemplate === REQUEST_REPLY) {
            templateFilesToDestination.set(this.baseTemplatePath + 'listeners', 'python/listeners');
        }
        templateFilesToDestination.set(this.baseTemplatePath + 'requirements.txt', 'requirements.txt');
        templateFilesToDestination.set(this.baseTemplatePath + 'src', 'python');
        templateFilesToDestination.set(this.baseTemplatePath + 'certificates/all_symphony_certs.pem',
            'certificates/all_symphony_certs.pem');
        templateFilesToDestination.set('python/.env', '.env');

        return templateFilesToDestination;
    }
};
