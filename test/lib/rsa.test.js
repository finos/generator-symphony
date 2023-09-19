const keyPair = require('../../generators/_lib/util').keyPair;
const forge = require('node-forge')

test('keyPair generates public and private keys', () => {
  let generated = keyPair(4096);

  expect(generated.public).toMatch(/BEGIN RSA PUBLIC KEY/)
  expect(generated.private).toMatch(/BEGIN RSA PRIVATE KEY/)

  let forgePrivateKey = forge.pki.privateKeyFromPem(generated.private);
  let forgePublicKey = forge.pki.setRsaPublicKey(forgePrivateKey.n, forgePrivateKey.e);
  let publicKey = forge.pki.publicKeyToRSAPublicKeyPem(forgePublicKey).toString();
  expect(generated.public.split("\n").join("")).toBe(publicKey.split("\n").join(""));
});
