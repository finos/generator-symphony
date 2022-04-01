var yeoman = require('yeoman-environment');
var Symphony = require('@finos/generator-symphony/generators/app');

var env = yeoman.createEnv();

env.registerStub(Symphony, 'symphony');
env.run('symphony', {
  destinationRoot: "generated",
  host: 'devx3.symphony.com',
  username: 'bobot',
  application: 'bot-app',
  language: 'java',
  framework: 'java',
  build: 'maven',
  groupId: 'com.mycompany',
  artifactId: 'bot-application',
  basePackage: 'com.mycompany.mybot'
});
