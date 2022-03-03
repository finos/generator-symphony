const SymphonyGenerator = require('@finos/generator-symphony/generators/app');
const colors = require('colors');

module.exports = class extends SymphonyGenerator {
  constructor(args, opts) {
    super(args, opts);
  }

  initializing() {
    console.log("This package has been moved under Finos scope, check out https://www.npmjs.com/package/@finos/generator-symphony.".red);
    console.log("Executing the new \"yo @finos/symphony\" command instead ...\n".red);
    super.initializing();
  }

  async prompting() {
    await super.prompting();
  }
}
