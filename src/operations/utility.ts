import { Command } from '@oclif/command';
import askFuzzy from '../util/getFuzzyChoice';
import colors from 'colors';
import prompts from 'prompts';
import shellExecAsync from '../util/shellExecAsync';

const choices = [
  {
    title: 'npm bulk uninstall',
    value: 'npm-bulk-uninstall',
    description: 'Uninstall by bulk selection and fuzzy search',
  },
];

class Utility extends Command {
  async run() {
    const { operation } = await askFuzzy(choices);

    switch (operation) {
      case 'npm-bulk-uninstall':
        await this.npmBulkUninstall();
        break;

      default:
        break;
    }
  }

  async npmBulkUninstall() {
    const output: string = await shellExecAsync(`npm list --depth=0 --json`, { silent: true }, { loadingMsg: 'Analyzing directory...' });
    const { dependencies } = JSON.parse(output);
    if (!dependencies) return console.log(colors.red('package.json not found in the drectory'));
    const allPackages = Object.keys(dependencies).map(pkgName => ({ name: pkgName, ...dependencies[pkgName] }));

    const { selectedPackages } = await prompts({
      type: 'multiselect',
      name: 'selectedPackages',
      message: 'Select the packages you want to uninstall.',
      choices: allPackages.map((pkg: any) => ({ title: pkg.name, value: pkg.name, description: pkg.version })),
      min: 1,
    });

    for (const pkgName of selectedPackages) {
      await shellExecAsync(`npm un ${pkgName}`, { silent: true }, { loadingMsg: `Uninstalling ${pkgName}` });
      console.log(colors.green(`${colors.red(pkgName)} uninstalled`));
    }
  }
}

export default Utility;
