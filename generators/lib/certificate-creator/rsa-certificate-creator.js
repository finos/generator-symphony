const forge = require('node-forge');
const fs = require('fs');

class RsaKeyPairCreator {
  constructor(username) {
    this.username = username;
  }

  create() {
    let pair = keyPair(4096)

    const rsa_folder = 'rsa';
    fs.mkdirSync(rsa_folder)
    fs.writeFileSync(rsa_folder + "/" + "rsa-public-" + this.username + ".pem", pair.public);
    fs.writeFileSync(rsa_folder + "/" + "rsa-private-" + this.username + ".pem", pair.private);
  }
}

/**
 * Return a RSA key pair in PEM format.
 *
 * @param size the size for the private key in bits.
 * @returns {{private, public}} private and public key content in PEM format.
 */
function keyPair(size) {
  let generated = forge.pki.rsa.generateKeyPair(size);
  return {
    private: forge.pki.privateKeyToPem(generated.privateKey),
    public: forge.pki.publicKeyToRSAPublicKeyPem(generated.publicKey)
  };
}

module.exports = RsaKeyPairCreator;
module.exports.keyPair = keyPair;
