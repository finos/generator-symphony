const colors = require('colors');
const certificate = require('selfsigned');
const fs = require('fs');

var CertificateCreator = {};

CertificateCreator.attrs = [{
    name: 'commonName',
    value: 'to_be_replace_with_appname'
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
}]

CertificateCreator.create = function(answers, path) {

    /* Change the CName with the application Name */
    var attrs = CertificateCreator.attrs.slice(0);
    attrs[0].value = answers.application_name;

    console.log(attrs);

    certificate.generate( attrs, {
        keySize: 2048, // the size for the private key in bits (default: 1024)
        days: 365, // how long till expiry of the signed certificate (default: 365)
        algorithm: 'sha256', // sign the certificate with specified algorithm (default: 'sha1')
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
        }], // certificate extensions array
        pkcs7: true, // include PKCS#7 as part of the output (default: false)
        clientCertificate: true, // generate client cert signed by the original key (default: false)
        clientCertificateCN: answers.application_name // client certificate's common name
    }, function(err, pems) {
        let log_text = ('* Generating certificate...').bold;
        console.log(log_text.bgRed.white);
        fs.writeFile(path + "/" + answers.application_name + ".pem", pems.clientcert + "\n" +
          pems.clientprivate + "\n" + pems.clientpublic + "\n" + pems.clientpkcs7 + "\n" +
            pems.cert + "\n" + pems.fingerprint + "\n" + pems.private + "\n" + pems.public, function(err) {
            if (err) {
                return console.log(err);
            }

        });
        fs.writeFile(path + "/" + "ca-cer-" + answers.application_name + ".cer", pems.cert, function(err) {
            if (err) {
                return console.log(err);
            }
            let log_text = ('* Generation completed successfully').bold;
            console.log(log_text.bgGreen.white);
        });
    });

};

module.exports = CertificateCreator;
