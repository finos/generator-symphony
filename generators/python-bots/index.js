const Generator = require('yeoman-generator');
const CertificateCreator = require('../lib/certificate-creator');

module.exports = class extends Generator {
    prompting() {
        return this.prompt([
            {
                type: 'list',
                name: 'python_bot_tpl',
                message: 'Which template do you want to start with',
                choices: ['Request/Reply', 'Elements Form']
            }
        ]).then((answers) => {
            answers.application_name = this.options.initPrompts.application_name;
            answers.subdomain = this.options.initPrompts.subdomain;
            answers.sessionAuthSuffix = this.options.initPrompts.sessionAuthSuffix;
            answers.keyAuthSuffix = this.options.initPrompts.keyAuthSuffix;
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
                answers.botRSAPath = '../rsa/';
                answers.botRSAName = 'rsa-private-' + answers.botusername + '.pem';
                answers.botUserName = '';
            } else if (answers.encryption === 'Self Signed Certificate') {
                answers.authType = 'cert';
                answers.botCertPath = '../certificates/';
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
                this.fs.copy(
                    this.templatePath('python/bots/request-reply/listeners'),
                    this.destinationPath('python/listeners')
                )
                this.fs.copyTpl(
                    this.templatePath('python/bots/request-reply/config.json'),
                    this.destinationPath('resources/config.json'),
                    answers
                );
                this.fs.copyTpl(
                    this.templatePath('python/bots/request-reply/certificates/all_symphony_certs_truststore'),
                    this.destinationPath('certificates/all_symphony_certs_truststore'),
                    answers
                )
                this.fs.copy(
                    this.templatePath('python/.env'),
                    this.destinationPath('.env')
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
                this.fs.copyTpl(
                    this.templatePath('python/bots/elements_form/certificates/all_symphony_certs_truststore'),
                    this.destinationPath('certificates/all_symphony_certs_truststore'),
                    answers
                )
                this.fs.copy(
                    this.templatePath('python/.env'),
                    this.destinationPath('.env')
                );
            }
            /* Install certificate */
            CertificateCreator.create(this.options.initPrompts.encryption, answers.botusername, answers.botemail);

            let log_text_completion = ('* BOT generated successfully!!').bold;
            console.log(log_text_completion.bgGreen.white);
        });
    }
};
