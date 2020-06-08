const RsaCertificateCreator = require('./rsa-certificate-creator')
const P12CertificateCreator = require('./p12-certificate-creator');

let CertificateCreator = {};

CertificateCreator.create = (encryption, botUsername, botEmail) => {
  if (encryption === 'Self Signed Certificate') {
    let log_text_cert = ('* Generating certificate for BOT ' + botUsername + '...').bold
    console.log(log_text_cert.bgRed.white)
    P12CertificateCreator.create(botUsername, botEmail)
  } else if (encryption === 'RSA - Generate New Keys') {
    let log_text_cert = ('* Generating RSA public/private keys for BOT ' + botUsername + '...').bold
    console.log(log_text_cert.bgRed.white)
    RsaCertificateCreator.createRSA(botUsername, 'rsa')
  }
}

module.exports = CertificateCreator;