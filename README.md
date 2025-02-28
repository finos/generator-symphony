[![FINOS - Active](https://cdn.jsdelivr.net/gh/finos/contrib-toolbox@master/images/badge-active.svg)](https://community.finos.org/docs/governance/Software-Projects/stages/active)
[![npm version](https://badge.fury.io/js/@finos%2Fgenerator-symphony.svg)](https://badge.fury.io/js/@finos%2Fgenerator-symphony)
[![Build](https://github.com/finos/symphony-bdk-java/actions/workflows/build.yml/badge.svg)](https://github.com/finos/symphony-bdk-java/actions/workflows/build.yml)

# Symphony Generator
Yeoman based generator for Symphony Bots and Applications:
- [Java bot](https://github.com/finos/symphony-bdk-java)
- [Python bot](https://github.com/finos/symphony-bdk-python)
- [WDK (Symphony Workflow Developer Kit)](https://github.com/finos/symphony-wdk)

## Installation
Install the Yeoman utility and Symphony Generator
```shell
npm install -g yo @finos/generator-symphony
```

## Usage
![](./docs/gifs/demo.gif)

Create a new directory and go into it
```shell
mkdir myBot && cd myBot
```
Run Symphony Generator and follow instructions on screen
```shell
yo @finos/symphony
```
If you are behind a web proxy, use the `https_proxy` environment variable to configure the address of your proxy server and port.
```shell
export https_proxy=http://localhost:3128
```
Symphony Generator will automatically fetch the latest version of BDKs/WDK and use it to generate your project. In case the request fails, it will fallback on a default version.

In case of a Java bot application, once the project is generated, the generator will try to download the chosen package manager wrapper to build the project. If for any reason (e.g. network constraint) the build fails, the generator will then try to build the project again by using local package manager.

_NOTE:_ The generation process will continue no matter what the build status is.  

## Contributing

1. Fork it (<https://github.com/finos/generator-symphony/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Read our [contribution guidelines](.github/CONTRIBUTING.md) and [Community Code of Conduct](https://www.finos.org/code-of-conduct)
4. Commit your changes (`git commit -am 'Add some fooBar'`)
5. Push to the branch (`git push origin feature/fooBar`)
6. Create a new Pull Request

_NOTE:_ Commits and pull requests to FINOS repositories will only be accepted from those contributors with an active, executed Individual Contributor License Agreement (ICLA) with FINOS OR who are covered under an existing and active Corporate Contribution License Agreement (CCLA) executed with FINOS. Commits from individuals not covered under an ICLA or CCLA will be flagged and blocked by the FINOS Clabot tool (or [EasyCLA](https://github.com/finos/community/blob/master/governance/Software-Projects/EasyCLA.md)). Please note that some CCLAs require individuals/employees to be explicitly named on the CCLA.

*Need an ICLA? Unsure if you are covered under an existing CCLA? Email [help@finos.org](mailto:help@finos.org)*


## Legacy generators
> :warning: It is not recommended using the legacy generators, as the underlying libraries are not maintained anymore.

To generate legacy projects (.NET, NodeJS and legacy Java/Python SDKs), please run the following command:
```shell
npm install generator-symphony@1.7.7
```
or build your own version from the [`legacy`](https://github.com/finos/generator-symphony/tree/legacy) branch.

## License

Copyright 2022 Symphony LLC

Distributed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).

SPDX-License-Identifier: [Apache-2.0](https://spdx.org/licenses/Apache-2.0)
