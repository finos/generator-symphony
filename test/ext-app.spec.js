import helpers from 'yeoman-test'
import assert from 'yeoman-assert'
import axios from 'axios'
import { getGenerator } from './test-utils.js'
import sinon from 'sinon'

describe('Ext App', () => {
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

  beforeEach(() => sinon.stub(axios, 'get').resolves(versions))

  afterEach(sinon.restore)

  it('Basic', () => helpers
      .run(getGenerator())
      .withAnswers({
        host: 'acme.symphony.com',
        application: 'ext-app',
        appId: 'my-app-id',
        type: 'Basic',
      })
      .then(() => {
        assert.file([
          'bundle.json',
          'package.json',
          'webpack.config.js',
          'src/index.js',
        ]);
      })
  )

  it('Message Renderer', () => helpers
      .run(getGenerator())
      .withAnswers({
        host: 'acme.symphony.com',
        application: 'ext-app',
        appId: 'my-app-id',
        type: 'Message Renderer',
      })
      .then(() => {
        assert.file([
          'bundle.json',
          'package.json',
          'webpack.config.js',
          'src/index.js',
        ]);
      })
  )

  it('App View - JavaScript', () => helpers
      .run(getGenerator())
      .withAnswers({
        host: 'acme.symphony.com',
        application: 'ext-app',
        appId: 'my-app-id',
        type: 'App View',
        script: 'JavaScript',
      })
      .then(() => {
        assert.file([
          'bundle.json',
          'package.json',
          'webpack.config.js',
          'src/index.js',
          'src/views/view-abc.jsx',
          'src/views/view-abc.css',
        ]);
      })
  )

  it('App View - TypeScript', () => helpers
    .run(getGenerator())
    .withAnswers({
      host: 'acme.symphony.com',
      application: 'ext-app',
      appId: 'my-app-id',
      type: 'App View',
      script: 'TypeScript',
    })
    .then(() => {
      assert.file([
        'bundle.json',
        'package.json',
        'webpack.config.js',
        'tsconfig.json',
        'src/index.ts',
        'src/views/view-abc.tsx',
        'src/views/view-abc.css',
      ]);
    })
  )
})
