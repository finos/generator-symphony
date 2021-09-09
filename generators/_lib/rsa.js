const forge = require('node-forge');

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

module.exports.keyPair = keyPair;
