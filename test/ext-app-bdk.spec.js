import helpers from 'yeoman-test'
import assert from 'yeoman-assert'
import axios from 'axios'
import { getGenerator } from './test-utils.js'
import sinon from 'sinon'

describe('Ext App BDK', () => {
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

  beforeEach(() => {
    sinon.restore()
    sinon.stub(axios, 'get').resolves(versions)
  });

  afterEach(sinon.restore)

  it('Sandbox - JavaScript - Java - Maven', () => {
    return helpers.run(getGenerator())
      .withAnswers({
        host: 'develop2.symphony.com',
        application: 'ext-app-bdk',
        appId: 'my-app-id',
        script: 'JavaScript',
        bdk: 'Java',
        basePackage: 'com.mycompany',
        build: 'Maven'
      })
      .then(() => {
        assert.file([
          'web/webpack.config.js',
          'web/.babelrc',
          'web/package.json',
          'web/src/index.js',
          'web/src/views/view-abc.jsx',
          'web/src/views/view-abc.css',
          'web/bundle.json',
          'backend/src/main/resources/application.yaml',
          'backend/src/main/java/com/mycompany/App.java',
          'backend/src/main/java/com/mycompany/SecurityConfig.java',
          'backend/mvnw',
          'backend/mvnw.cmd',
          'backend/.mvn/wrapper/MavenWrapperDownloader.java',
          'backend/.mvn/wrapper/maven-wrapper.jar',
          'backend/.mvn/wrapper/maven-wrapper.properties',
          'backend/pom.xml',
        ]);
      })
  })

  it('JavaScript - Java - Gradle', () => {
    return helpers.run(getGenerator())
      .withAnswers({
        host: 'acme.symphony.com',
        application: 'ext-app-bdk',
        appId: 'my-app-id',
        script: 'JavaScript',
        bdk: 'Java',
        basePackage: 'com.mycompany',
        build: 'Gradle'
      })
      .then(() => {
        assert.file([
          'web/webpack.config.js',
          'web/.babelrc',
          'web/package.json',
          'web/src/index.js',
          'web/src/views/view-abc.jsx',
          'web/src/views/view-abc.css',
          'web/bundle.json',
          'backend/src/main/resources/application.yaml',
          'backend/src/main/java/com/mycompany/App.java',
          'backend/src/main/java/com/mycompany/SecurityConfig.java',
          'backend/gradlew',
          'backend/gradlew.bat',
          'backend/gradle/wrapper/gradle-wrapper.jar',
          'backend/gradle/wrapper/gradle-wrapper.properties',
          'backend/build.gradle',
        ]);
      })
  })

  it('TypeScript - Java - Gradle', () => {
    return helpers.run(getGenerator())
      .withAnswers({
        host: 'acme.symphony.com',
        application: 'ext-app-bdk',
        appId: 'my-app-id',
        script: 'TypeScript',
        bdk: 'Java',
        basePackage: 'com.mycompany',
        build: 'Gradle'
      })
      .then(() => {
        assert.file([
          'web/webpack.config.js',
          'web/tsconfig.json',
          'web/package.json',
          'web/src/index.ts',
          'web/src/views/view-abc.tsx',
          'web/src/views/view-abc.css',
          'web/bundle.json',
          'backend/src/main/resources/application.yaml',
          'backend/src/main/java/com/mycompany/App.java',
          'backend/src/main/java/com/mycompany/SecurityConfig.java',
          'backend/gradlew',
          'backend/gradlew.bat',
          'backend/gradle/wrapper/gradle-wrapper.jar',
          'backend/gradle/wrapper/gradle-wrapper.properties',
          'backend/build.gradle',
        ]);
      })
  })

  it('JavaScript - Python', () => {
    return helpers.run(getGenerator())
      .withAnswers({
        host: 'acme.symphony.com',
        application: 'ext-app-bdk',
        appId: 'my-app-id',
        script: 'JavaScript',
        bdk: 'Python',
      })
      .then(() => {
        assert.file([
          'web/webpack.config.js',
          'web/.babelrc',
          'web/package.json',
          'web/src/index.js',
          'web/src/views/view-abc.jsx',
          'web/src/views/view-abc.css',
          'web/bundle.json',
          'backend/resources/logging.conf',
          'backend/resources/config.yaml',
          'backend/.gitignore',
          'backend/readme.md',
          'backend/requirements.txt',
          'backend/src/__main__.py',
          'backend/src/ext_app_be.py',
        ]);
      })
  })

  it('TypeScript - Python', () => {
    return helpers.run(getGenerator())
      .withAnswers({
        host: 'acme.symphony.com',
        application: 'ext-app-bdk',
        appId: 'my-app-id',
        script: 'TypeScript',
        bdk: 'Python',
      })
      .then(() => {
        assert.file([
          'web/webpack.config.js',
          'web/tsconfig.json',
          'web/package.json',
          'web/src/index.ts',
          'web/src/views/view-abc.tsx',
          'web/src/views/view-abc.css',
          'web/bundle.json',
          'backend/resources/logging.conf',
          'backend/resources/config.yaml',
          'backend/.gitignore',
          'backend/readme.md',
          'backend/requirements.txt',
          'backend/src/__main__.py',
          'backend/src/ext_app_be.py',
        ]);
      })
  })
})
