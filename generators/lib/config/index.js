/**
 * Generates the configuration file from user answers.
 *
 * @param {string} subDomain
 * @param {string} botUsername
 * @param {string} botEmailAddress
 * @param {object} rsaConfig
 * @param {object} certConfig
 * @returns {{}}
 */
module.exports.generateConfig = function (subDomain, botUsername, botEmailAddress, rsaConfig, certConfig) {

    const host = subDomain + '.symphony.com';

    const config = {

        sessionAuthHost: host,
        sessionAuthPort: 443,
        keyAuthHost: host,
        keyAuthPort: 443,
        podHost: host,
        podPort: 443,
        agentHost: host,
        agentPort: 443,

        truststorePath: 'certificates/all_symphony_certs_truststore',
        truststorePassword: 'changeit',

        botUsername: botUsername,
        botEmailAddress: botEmailAddress,

        proxyURL: '',
        proxyUsername: '',
        proxyPassword: '',
        keyManagerProxyURL: '',
        keyManagerProxyUsername: '',
        keyManagerProxyPassword: ''
    };

    if (rsaConfig) {
        config.botPrivateKeyPath = rsaConfig.botPrivateKeyPath;
        config.botPrivateKeyName = rsaConfig.botPrivateKeyName;
    }

    if (certConfig) {
        config.botCertPath = rsaConfig.botCertPath;
        config.botCertName = rsaConfig.botCertName;
        config.botCertPassword = rsaConfig.botCertPassword;
    }

    return config;
};