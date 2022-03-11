const SymphonyGenerator = require('@finos/generator-symphony/generators/app');
const colors = require('colors');

module.exports = class extends SymphonyGenerator {
  constructor(args, opts) {
    super(args, opts);
  }

  initializing() {
    console.log(`(!) This package has been moved under Finos scope, check out the new location https://www.npmjs.com/package/@finos/generator-symphony.`.red);
    console.log(`(!) Consider installing the new package executing \"npm i -g @finos/generator-symphony\" and then run it by using the command \"yo @finos/symphony\".\n`.red)
    console.log(`Executing the new \"yo @finos/symphony\" command instead ...\n`.red);
    super.initializing();
  }

  async prompting() {
    await super.prompting();
  }
}
