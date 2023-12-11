import { keyPair } from '../../generators/_lib/util.js'
import forge from 'node-forge'
import { expect } from 'chai';

describe('RSA scenarios', () => {
  it('keyPair generates public and private keys', () => {
    let generated = keyPair(4096)

    expect(generated.public).match(/BEGIN RSA PUBLIC KEY/)
    expect(generated.private).match(/BEGIN RSA PRIVATE KEY/)

    let forgePrivateKey = forge.pki.privateKeyFromPem(generated.private)
    let forgePublicKey = forge.pki.setRsaPublicKey(forgePrivateKey.n, forgePrivateKey.e)
    let publicKey = forge.pki.publicKeyToRSAPublicKeyPem(forgePublicKey).toString()
    expect(generated.public.split("\n").join("")).to.be.eq(publicKey.split("\n").join(""))
  })
})
