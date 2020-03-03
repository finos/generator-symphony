const packageJson = require('../../package.json');
const colors = require('colors');

/**
 * Externalized Header display function
 *
 * @param log Provided by the Generator
 */
module.exports.display = function (log) {

    const year = new Date().getFullYear();
    const version = packageJson.version;

    log('/------------------------------------------/'.cyan);
    log('/'.cyan + '            SYMPHONY GENERATOR  '.bold + '          /'.cyan);
    log('/    by platformsolutions@symphony.com     /'.cyan);
    log(`/ (c) ${year} Symphony Communication Services /`.cyan);
    log('/'.cyan + `             v${version}      ` + '        /'.cyan);
    log('/------------------------------------------/'.cyan)

};