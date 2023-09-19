const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const path = require('path')

const axios = require("axios");
jest.mock('axios');

const generator = path.join(__dirname, '../generators/app')

describe('Ext App', () => {
  const currentDir = process.cwd()

  const versions = {
    "data": {
      "dist-tags": {
        "latest": "1.3.0",
      },
      "info": {
        "version":"2.7.0",
      },
      "response": {
        "docs": [{
          "id": "2.7.0",
          "v": "2.7.0",
        }],
      }
    }
  }

  beforeAll(() => axios.mockResolvedValue(versions))

  afterAll(() => {
    process.chdir(currentDir);
    jest.resetAllMocks();
  })

  it('Basic', () => {
    return helpers.run(generator)
      .inTmpDir()
      .withPrompts({
        host: 'acme.symphony.com',
        application: 'ext-app',
        appId: 'my-app-id',
        type: 'Basic',
      })
      .then(() => {
        assert.file([
          'bundle.json',
          'node_modules',
          'package.json',
          'webpack.config.js',
          'src/index.js',
        ]);
      })
  })

  it('Message Renderer', () => {
    return helpers.run(generator)
      .inTmpDir()
      .withPrompts({
        host: 'acme.symphony.com',
        application: 'ext-app',
        appId: 'my-app-id',
        type: 'Message Renderer',
      })
      .then(() => {
        assert.file([
          'bundle.json',
          'node_modules',
          'package.json',
          'webpack.config.js',
          'src/index.js',
        ]);
      })
  })

  it('App View - JavaScript', () => {
    return helpers.run(generator)
      .inTmpDir()
      .withPrompts({
        host: 'acme.symphony.com',
        application: 'ext-app',
        appId: 'my-app-id',
        type: 'App View',
        script: 'JavaScript',
      })
      .then(() => {
        assert.file([
          'bundle.json',
          'node_modules',
          'package.json',
          'webpack.config.js',
          'src/index.js',
          'src/views/view-abc.jsx',
          'src/views/view-abc.css',
        ]);
      })
  })

  it('App View - TypeScript', () => {
    return helpers.run(generator)
      .inTmpDir()
      .withPrompts({
        host: 'acme.symphony.com',
        application: 'ext-app',
        appId: 'my-app-id',
        type: 'App View',
        script: 'TypeScript',
      })
      .then(() => {
        assert.file([
          'bundle.json',
          'node_modules',
          'package.json',
          'webpack.config.js',
          'tsconfig.json',
          'src/index.ts',
          'src/views/view-abc.tsx',
          'src/views/view-abc.css',
        ]);
      })
  })
})
