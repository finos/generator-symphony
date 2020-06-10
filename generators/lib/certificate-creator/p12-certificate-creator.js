const fs = require('fs');
const selfsigned = require('selfsigned');
const util = require('util')

class P12CertificateCreator {
    constructor(username, email) {
        this.username = username;
        this.email = email;

        this.p12Options = {
            bitSize: 2048,
            clientFileName: this.username,
            C: 'EX',
            ST: 'Example',
            L: 'Example',
            O: 'Example',
            OU: 'Example',
            CN: this.username,
            emailAddress: this.email,
            clientPass: 'changeit',
            caFileName: this.username + '-ca',
            serial: '01',
            days: 365
        };

        this.sslAttributes = [{
            name: 'commonName',
            value: this.username
        }, {
            name: 'countryName',
            value: 'GB'
        }, {
            shortName: 'ST',
            value: 'GB'
        }, {
            name: 'localityName',
            value: 'London'
        }, {
            name: 'organizationName',
            value: 'Symphony Development Certificate'
        }, {
            shortName: 'OU',
            value: 'FOR TEST USE ONLY'
        }];

        this.sslOptions = {
            keySize: 2048,
            days: 365,
            algorithm: 'sha256',
            extensions: [{
                name: 'basicConstraints',
                cA: true
            }, {
                name: 'keyUsage',
                keyCertSign: true,
                digitalSignature: true,
                nonRepudiation: true,
                keyEncipherment: true,
                dataEncipherment: true
            }]
        };
    }

    create() {
        const generateSelfSignedCert = util.promisify(selfsigned.generate);

        generateSelfSignedCert(this.sslAttributes, this.sslOptions)
            .then(pem => this.writeSslFiles(pem))
            .then(() => this.createSslClientCert())
            .then(() => this.moveSslFilesToCertificatesFolder())
            .catch(error => console.error(error))
    }

    createSslClientCert() {
        return new Promise(((resolve, reject) => {
            // require put here because
            // dirPath of node-ssl-p12 evaluated to path.join( process.cwd(), 'ssl') at module load time
            // having require outside the class lead to SSL files not found
            require('node-openssl-p12').createClientSSL(this.p12Options)
                .done((options, sha1fingerprint) => resolve())
                .fail(error => reject(error));
        }))
    }

    writeSslFiles(pem) {
        fs.mkdirSync(P12CertificateCreator.ssl_folder);

        fs.writeFileSync(P12CertificateCreator.ssl_folder + '/' + this.username + '-ca.key', pem.private);
        fs.writeFileSync(P12CertificateCreator.ssl_folder + '/' + this.username + '-ca.crt', pem.cert);
    };

    moveSslFilesToCertificatesFolder() {
        if (!fs.existsSync(P12CertificateCreator.cert_folder)) {
            fs.mkdirSync(P12CertificateCreator.cert_folder);
        }

        fs.unlinkSync(P12CertificateCreator.ssl_folder + '/' + this.username + '-ca.key');

        fs.renameSync(P12CertificateCreator.ssl_folder + '/' + this.username + '-ca.crt',
            P12CertificateCreator.cert_folder + '/' + this.username + '-ca.crt');
        fs.renameSync(P12CertificateCreator.ssl_folder + '/' + this.username + '.p12',
            P12CertificateCreator.cert_folder + '/' + this.username + '.p12');

        fs.rmdirSync(P12CertificateCreator.ssl_folder);
    }
}

P12CertificateCreator.ssl_folder = 'ssl';
P12CertificateCreator.cert_folder = 'certificates';

module.exports = P12CertificateCreator;