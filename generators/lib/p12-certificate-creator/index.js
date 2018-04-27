const p12 = require('node-openssl-p12');
const fs = require('fs');
var mkdirp = require('mkdirp');
const selfsigned = require('selfsigned');


var P12CertificateCreator = {};

P12CertificateCreator.attrs = [{
    name: 'commonName',
    value: 'to-be-replaced'
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

P12CertificateCreator.create = (botusername, botemail) => {
    var attrs = P12CertificateCreator.attrs.slice(0);
    attrs[0].value = botusername;
    
    
    selfsigned.generate( attrs, {
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
        }], 
    }, function(err, pems) {
        mkdirp.sync( 'ssl' );
        
        fs.writeFile('ssl/'+botusername+'-ca.key', pems.private , function(err) {
            if (err) {
                return console.log(err);
            }

        });
        fs.writeFile('ssl/'+botusername+'-ca.crt', pems.cert, function(err) {
          if (err) {
              return console.log(err);
          }});

          var p12options = {
            bitSize: 2048,
            clientFileName : botusername,
            C:'EX',
            ST: 'Example',
            L: 'Example',
            O: 'Example',
            OU: 'Example',
            CN: botusername,
            emailAddress: botemail,
            clientPass: 'changeit',
            caFileName: botusername+'-ca',
            serial: '01',
            days: 365
        };
        p12.createClientSSL(p12options).done(function(options, sha1fingerprint) {
            fs.unlink('ssl/'+botusername+'-ca.key', function (err) {
                        if (err) throw err;
            });
            fs.rename('ssl/'+botusername+'-ca.crt', 'certificates/'+botusername+'-ca.crt', function (err) {
            if (err) throw err;
            });
            fs.rename('ssl/'+botusername+'.p12', 'certificates/'+botusername+'.p12', function (err) {
                if (err) throw err;
                });
            fs.rmdir("ssl", function (err) {
                if (err) throw err;
            });
        }).fail( function(err) {
            console.log(err);
        });
       

    });



    
}

module.exports = P12CertificateCreator;