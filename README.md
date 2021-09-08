# Symphony BDK Generator
[![npm version](https://badge.fury.io/js/generator-symphony.svg)](https://badge.fury.io/js/generator-symphony)
[![CircleCI](https://circleci.com/gh/SymphonyPlatformSolutions/generator-symphony.svg?style=shield)](https://circleci.com/gh/SymphonyPlatformSolutions/generator-symphony)

Yeoman based generator for Symphony Bots and Applications in 2 different languages:
- [Java](https://github.com/finos/symphony-bdk-java)
- [Python](https://github.com/finos/symphony-bdk-python)

## Quick Start

1. Install Yeoman command line utility `npm install -g yo`
2. Install Symphony BDK Generator `npm i -g generator-symphony`
3. Create a new directory and go into it `mkdir myBot && cd myBot`
4. Run Symphony BDK Generator and follow instructions on screen `yo symphony`

## Known issues

If you are using node 16.0.0 and encounter the following error when trying to run `yo symphony` or `yo symphony 2.0`:
```
/usr/local/lib/node_modules/yo/node_modules/editions/edition-es5/index.js:317

throw util_js_1.errtion(
^

Error: editions-autoloader-none-broadened: Unable to determine a suitable edition, even after broadening.
at new Errlop (/usr/local/lib/node_modules/yo/node_modules/errlop/edition-es5/index.js:61:18)
at Object.errtion (/usr/local/lib/node_modules/yo/node_modules/editions/edition-es5/util.js:23:14)
at determineEdition (/usr/local/lib/node_modules/yo/node_modules/editions/edition-es5/index.js:317:21)
at solicitEdition (/usr/local/lib/node_modules/yo/node_modules/editions/edition-es5/index.js:350:16)
at Object.requirePackage (/usr/local/lib/node_modules/yo/node_modules/editions/edition-es5/index.js:364:9)
at Object.<anonymous> (/usr/local/lib/node_modules/yo/node_modules/istextorbinary/index.cjs:4:38)
at Module._compile (node:internal/modules/cjs/loader:1108:14)
at Object.Module._extensions..js (node:internal/modules/cjs/loader:1137:10)
at Module.load (node:internal/modules/cjs/loader:988:32)
at Function.Module._load (node:internal/modules/cjs/loader:828:14)
↳ Error: editions-autoloader-none-suitable: Unable to determine a suitable edition, as none were suitable.
...
```
then please try to downgrade to node 15 or node 14 (seems to be linked with
https://github.com/electron-userland/electron-builder/issues/5668).

## Legacy generators

To generate legacy projects (not recommended), please run the following command:
```shell
npm install generator-symphony@1.7.7
```
or build your own version from the [`legacy`](https://github.com/SymphonyPlatformSolutions/generator-symphony/tree/legacy) branch.
