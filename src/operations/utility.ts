import { Command } from '@oclif/command';
import { askAutoCompleteMultiSelect, askFuzzy } from '@app/util/myPrompts';
import colors from 'colors';
import prompts from 'prompts';
import shellExecAsync from '@app/util/shellExecAsync';
import Table from 'cli-table';
import axios from 'axios';
import asyncLoader from '@app/util/asyncLoader';

const choices = [
  {
    title: 'Get npm packages info',
    value: 'get-npm-packages-info',
    description: 'If multiple, seprate them by space',
  },
  {
    title: 'npm single uninstall',
    value: 'npm-single-uninstall',
    description: 'Uninstall a single package',
  },
  {
    title: 'npm bulk uninstall',
    value: 'npm-bulk-uninstall',
    description: 'Uninstall by bulk selection',
  },
];

class Utility extends Command {
  async run() {
    const { operation } = await askFuzzy(choices, {});

    switch (operation) {
      case 'npm-single-uninstall':
        await this.npmSingleUninstall();
        break;

      case 'npm-bulk-uninstall':
        await this.npmBulkUninstall();
        break;

      case 'get-npm-packages-info':
        await this.getPackagesInfo();
        break;

      default:
        break;
    }
  }

  async npmSingleUninstall() {
    const output: string = await shellExecAsync(`npm list --depth=0 --json`, { silent: true }, { loadingMsg: 'Analyzing directory...' });
    const { dependencies } = JSON.parse(output);
    if (!dependencies) return console.log(colors.red('package.json not found in the drectory'));
    const allPackages = Object.keys(dependencies).map(pkgName => ({ name: pkgName, ...dependencies[pkgName] }));

    const { operation } = await askFuzzy(
      allPackages.map((pkg: any) => ({ title: pkg.name, value: pkg.name, description: pkg.version })),
      { message: 'Select the packages you want to uninstall.' }
    );

    await shellExecAsync(`npm un ${operation}`, { silent: true }, { loadingMsg: `Uninstalling ${operation}` });
    console.log(colors.green(`${colors.red(operation)} uninstalled`));
  }

  async npmBulkUninstall() {
    const output: string = await shellExecAsync(`npm list --depth=0 --json`, { silent: true }, { loadingMsg: 'Analyzing directory...' });
    const { dependencies } = JSON.parse(output);
    if (!dependencies) return console.log(colors.red('package.json not found in the drectory'));
    const allPackages = Object.keys(dependencies).map(pkgName => ({ name: pkgName, ...dependencies[pkgName] }));

    const { selectedItems: selectedPackages } = await askAutoCompleteMultiSelect(
      allPackages.map((pkg: any) => ({ title: pkg.name, value: pkg.name, description: pkg.version })),
      { message: 'Select the packages you want to uninstall' }
    );

    for (const pkgName of selectedPackages) {
      await shellExecAsync(`npm un ${pkgName}`, { silent: true }, { loadingMsg: `uninstalling ${pkgName}` });
      console.log(colors.green(`${colors.red(pkgName)} uninstalled`));
    }
  }

  async getPackagesInfo() {
    const { selectedPackages } = await prompts(
      {
        type: 'list',
        name: 'selectedPackages',
        message: 'Type the packages name',
        separator: ' ',
        validate: (packageNames: string) => (packageNames.split(' ').filter((name: any) => name).length ? true : 'At least one name required.'),
      },
      { onCancel: () => process.exit() }
    );

    const names = selectedPackages.filter((name: any) => name);

    const fetch = async () => {
      const table = new Table({ head: ['Name', 'Total Versions', 'Latest Version'].map(ele => colors.bold(colors.cyan(ele))) });
      for (const name of names) {
        await axios
          .get(`https://registry.npmjs.org/${name}`)
          .then(response => {
            const { versions } = response.data;
            table.push([name, Object.keys(versions).length, Object.keys(versions).reverse()[0]]);
          })
          .catch(err => {
            const NA = colors.red('N/A');
            // if err 404
            table.push([name, NA, NA]);
          });
      }

      return Promise.resolve(table);
    };

    const table = await asyncLoader(fetch, `Checking npm database`);

    console.log(table.toString());
  }
}

export default Utility;
