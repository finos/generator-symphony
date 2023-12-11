import forge from 'node-forge'
import assert from 'yeoman-assert'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

export const assertKeyPair = (generatedPrivateKey, generatedPublicKey) => {
  let forgePrivateKey = forge.pki.privateKeyFromPem(generatedPrivateKey);
  let forgePublicKey = forge.pki.setRsaPublicKey(forgePrivateKey.n, forgePrivateKey.e);
  let publicKey = forge.pki.publicKeyToRSAPublicKeyPem(forgePublicKey).toString();
  assert.textEqual(generatedPublicKey.split("\n").join(""), publicKey.split("\n").join(""))
}

export const getGenerator = () => dirname(dirname(fileURLToPath(import.meta.url))) + '/generators/app'
