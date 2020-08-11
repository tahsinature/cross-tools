import { Command } from '@oclif/command';
import askFuzzy from '../util/getFuzzyChoice';
import shell from 'shelljs';
import colors from 'colors';
import prompts from 'prompts';
import ora from 'ora';

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
    const output: any = shell.exec(`npm list --depth=0 --json`, { silent: true }).stdout;
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
      const spinner = ora(`Uninstalling ${pkgName}`);
      spinner.start();
      shell.exec(`npm un ${pkgName}`, { silent: true });
      spinner.stop();
      console.log(colors.green(`${colors.red(pkgName)} uninstalled`));
    }
  }
}

export default Utility;
