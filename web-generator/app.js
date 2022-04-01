const express = require('express')
const zip = require('express-zip');
const glob = require('glob');
const fs = require('fs');
const path = require('path');
const yeoman = require('yeoman-environment');
const Symphony = require('@finos/generator-symphony/generators/app');

const app = express()
app.use(express.static('public'))
const port = 3000

app.get('/generate', async (req, res) => {

  console.log(req.query)
  fs.rmSync('generated', {recursive: true, force: true});

  var env = yeoman.createEnv();
  env.registerStub(Symphony, 'symphony');
  await env.run('symphony', {
    destinationRoot: "generated",
    ...req.query,
    // host: 'devx3.symphony.com',
    username: 'bobot',
    application: 'bot-app',
    language: 'java',
    framework: 'java',
    build: 'Maven',
    groupId: 'com.mycompany',
    artifactId: 'bot-application',
    basePackage: 'com.mycompany.mybot'
  });
  glob(path.join('generated', '**/*'), {dot: true, nodir: true}, (err, files) => {

    const fileList = files.map((file) => {
      return {
        path: file,
        name: path.relative('generated', file),
      };
    });

    res.zip(fileList, 'mybot.zip');
  });

})

app.listen(port, () => {
  console.log(`Running...`)
})
