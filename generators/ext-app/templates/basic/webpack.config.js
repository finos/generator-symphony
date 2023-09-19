const SymADKWebpack = require('@symphony-ui/adk-webpack');
const packageJson = require('./package.json');
module.exports = SymADKWebpack({}, packageJson.name);
