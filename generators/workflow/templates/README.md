# Symphony Workflow Developer Kit (WDK)

## Getting started
Check out the [Getting starting guide](https://github.com/finos/symphony-wdk/blob/master/docs/getting-started.md) for an introduction.

## Project's structure
The generated project has 4 folders:
- **[rsa](rsa):** contains generated RSA public and private keys for the workflow bot.
- **[workflows](workflows):** can contain workflows to be executed by the bot.
- **[src](src):** contains custom activities with Java models and activity executors.
- **[lib](lib):** can contain JAR files and dependencies of custom activities.

## How to run the generated bot
After placing your _swadl.yaml_ workflow file in _[workflows](workflows)_ folder, you can execute _workflow-bot-app.jar_.
````shell
    java -jar workflow-bot-app.jar
````
_nb: Java 11 is required to run the WDK_

## Useful tasks to use
This project comes with the following Gradle tasks:
- ``./gradlew botJar`` used to download the WDK jar (executed upon bot's generation)
- ``./gradlew customActivityLibs`` used to copy custom activity dependencies in [lib](lib) folder.
- For more details, use ``./gradlew task --all``
