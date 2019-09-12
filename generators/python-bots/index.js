const Generator = require('yeoman-generator');
const colors = require('colors');
const certificateCreator = require('../lib/p12-certificate-creator');
const RSAcertificateCreator = require('../lib/certificate-creator');
var mkdirp = require('mkdirp');

module.exports = class extends Generator {
    prompting() {
        return this.prompt([
            {
                type: 'list',
                name: 'python_bot_tpl',
                message: 'Which template do you want to start with',
                choices: ['Request/Reply','Elements Form']
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
                answers.python_bot_tpl.italic + ' template...').bold;
            console.log(log_text.bgRed.white);
            console.log(answers.encryption);
            if (answers.encryption.startsWith('RSA')) {
                answers.authType = 'rsa';
                answers.botCertPath = '';
                answers.botCertName = '';
                answers.botCertPassword = '';
                answers.botRSAPath = answers.dirname + '/rsa/';
                answers.botRSAName = 'rsa-private-' + answers.botusername + '.pem';
                answers.botUserName = '';
            } else if (answers.encryption === 'Self Signed Certificate') {
                answers.authType = 'cert';
                answers.botCertPath = answers.dirname + '/certificates/';
                console.log(answers.botCertPath);
                answers.botCertName = answers.botusername;
                answers.botCertPassword = 'changeit';
                answers.botRSAPath = '';
                answers.botRSAName = '';
            } else {
                //Java has this set to cert
                // answers.authType = 'cert';
                answers.botCertPath = '';
                answers.botCertName = '';
                answers.botCertPassword = '';
                answers.botRSAPath = '';
                answers.botRSAName = '';
            }

            if (answers.python_bot_tpl === 'Request/Reply') {
                this.fs.copyTpl(
                    this.templatePath('python/bots/request-reply/requirements.txt'),
                    this.destinationPath('requirements.txt'),
                    answers
                );
                this.fs.copy(
                    this.templatePath('python/bots/request-reply/src'),
                    this.destinationPath('python')
                );
                this.fs.copyTpl(
                    this.templatePath('python/bots/request-reply/config.json'),
                    this.destinationPath('resources/config.json'),
                    answers
                );

	    } else if (answers.python_bot_tpl === 'Elements Form') {
                this.fs.copyTpl(
                    this.templatePath('python/bots/elements_form/requirements.txt'),
                    this.destinationPath('requirements.txt'),
                    answers
                );
                this.fs.copy(
                    this.templatePath('python/bots/elements_form/src'),
                    this.destinationPath('python')
                );
                this.fs.copyTpl(
                    this.templatePath('python/bots/elements_form/config.json'),
                    this.destinationPath('resources/config.json'),
                    answers
                );
            }
            /* Install certificate */
            /*TODO add logging */
            if (answers.encryption === 'Self Signed Certificate') {
                let log_text_cert = ('* Generating certificate for BOT ' + answers.botusername + '...').bold;
                console.log(log_text_cert.bgRed.white);
                mkdirp.sync('certificates');
                certificateCreator.create(answers.botusername, 'certificates');
            } else if (answers.encryption === 'RSA - Generate New Keys') {
                let log_text_cert = ('* Generating RSA public/private keys for BOT ' + answers.botusername + '...').bold;
                console.log(log_text_cert.bgRed.white);
                mkdirp.sync('rsa');
                RSAcertificateCreator.createRSA(answers.botusername, 'rsa');
            }

            let log_text_completion = ('* BOT generated successfully!!').bold;
            console.log(log_text_completion.bgGreen.white);
        });
    }
};
