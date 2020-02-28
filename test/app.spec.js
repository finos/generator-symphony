const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const path = require('path');

test('Generate simple Java BOT', () => {

    // The object returned acts like a promise, so return it to wait until the process is done
    return helpers.run(path.join(__dirname, '../generators/app'))
        .withPrompts({
            application_type: 'bot',
            application_name: 'test',
            subdomain: 'test',
            application_lang: 'Java',
            botusername: 'testbot',
            botemail: 'testbot@acme.com',
            encryption: 'RSA - Generate New Keys',
            templateName: 'java8',
            javaBasePackage: 'com.symphony.test'
        })
        .then(function() {
            assert.file([
                '.gitignore',
                'pom.xml',
                '.mvn',
                'mvnw',
                'mvnw.cmd'
            ]);

            assert.jsonFileContent('src/main/resources/config.json', {
                podHost: 'test.symphony.com',
                botUsername: 'testbot',
                botEmailAddress: 'testbot@acme.com'
            });
        });
});
