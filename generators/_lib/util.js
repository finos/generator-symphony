import forge from 'node-forge'
import axios from 'axios'

const JAVA_BDK_VERSION_DEFAULT = '2.14.3'
const PYTHON_BDK_VERSION_DEFAULT = '2.7.0'
const WDK_VERSION_DEFAULT = '1.6.3'
const SPRING_VERSION_DEFAULT = '2.7.16'
const ADK_VERSION_DEFAULT = '1.3.0'

const timeout = { timeout: 5000 }

/**
* Return a RSA key pair in PEM format.
*
* @param size the size for the private key in bits.
* @returns {{private, public}} private and public key content in PEM format.
*/
export const keyPair = (size) => {
  let generated = forge.pki.rsa.generateKeyPair(size || 4096);
  return {
    private: forge.pki.privateKeyToPem(generated.privateKey),
    public: forge.pki.publicKeyToRSAPublicKeyPem(generated.publicKey)
  };
}

/**
* Gets the latest Java BDK version from maven central
*
* @returns Java BDK version
*/
export const getJavaBdkVersion = async () => {
  const uri = 'https://search.maven.org/solrsearch/select?q=g:org.finos.symphony.bdk+AND+a:symphony-bdk-bom&core=gav'
  const response = await axios(uri, timeout).then(
    (response) => response?.data,
    () => null,
  );
  if (!response || response['response']['docs'].length === 0) {
    console.log('Failed to fetch latest Java BDK version from Maven Central')
    return JAVA_BDK_VERSION_DEFAULT;
  } else {
    return response['response']['docs'].filter(d => !d.id.match(/(RC|alpha)/g))[0].v;
  }
}

/**
* Gets the latest Python BDK version from PyPi
*
* @returns Python BDK version
*/
export const getPythonBdkVersion = async () => {
  const uri = 'https://pypi.org/pypi/symphony-bdk-python/json'
  const response = await axios(uri, timeout).then(
    (response) => response?.data,
    () => null,
  );
  if (!response) {
    console.log('Failed to fetch latest Python BDK version from PyPi')
    return PYTHON_BDK_VERSION_DEFAULT;
  } else {
    return response['info']['version'];
  }
}

/**
* Gets the latest WDK version from maven central
*
* @returns WDK version
*/
export const getWdkVersion = async () => {
  const uri = 'https://search.maven.org/solrsearch/select?q=g:org.finos.symphony.wdk+AND+a:workflow-bot-app&core=gav&rows=10'
  const response = await axios(uri, timeout).then(
    (response) => response?.data,
    () => null,
  );
  if (!response || response['response']['docs'].length === 0) {
    console.log('Failed to fetch latest WDK version from Maven Central')
    return WDK_VERSION_DEFAULT;
  } else {
    return response['response']['docs'].filter(d => !d.v.match(/-pre/g))[0].v;
  }
}

/**
* Gets the latest ADK version from NPM
*
* @returns ADK version
*/
export const getAdkVersion = async () => {
  const uri = 'https://registry.npmjs.org/@symphony-ui/adk';
  const response = await axios(uri, timeout).then(
    (response) => response?.data,
    () => null,
  );
  if (!response) {
    console.log('Failed to fetch latest ADK version from NPM')
    return ADK_VERSION_DEFAULT;
  } else {
    return response['dist-tags']?.latest;
  }
}

/**
* Gets the default Spring version
*
* @returns Default Spring version
*/
export const getSpringVersion = () => SPRING_VERSION_DEFAULT
