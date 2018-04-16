const colors = require('colors');
const certificate = require('selfsigned');
const fs = require('fs');
var attrs = [{
    name: 'commonName',
    value: 'megabot'
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

var create = function(answers, path) {
    certificate.generate(attrs, {
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
        clientCertificateCN: 'megabot' // client certificate's common name
    }, function(err, pems) {
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

            console.log("Your Bot certificate has been created and saved in the certificates folder!");
        });
    });

};
module.exports = create
