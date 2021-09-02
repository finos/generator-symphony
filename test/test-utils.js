const forge = require("node-forge");
const assert = require("yeoman-assert");

module.exports = {

  assertKeyPair(generatedPrivateKey, generatedPublicKey) {
    let forgePrivateKey = forge.pki.privateKeyFromPem(generatedPrivateKey);
    let forgePublicKey = forge.pki.setRsaPublicKey(forgePrivateKey.n, forgePrivateKey.e);
    let publicKey = forge.pki.publicKeyToRSAPublicKeyPem(forgePublicKey).toString();
    assert.textEqual(generatedPublicKey.split("\n").join(""), publicKey.split("\n").join(""))
  }
}
