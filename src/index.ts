import { Command, flags } from '@oclif/command';
import colors from 'colors';
import prompts from 'prompts';
import cli from 'cli-ux';

import ProcessAndPorts from './operations/processAndPorts';
import DockerTools from './operations/docker';
import Network from './operations/network';
import Utility from './operations/utility';

import * as fuzzy from 'fuzzy';
import shell from 'shelljs';
import semver from 'semver';
import ora from 'ora';

const choices = [
  {
    title: 'Process & Port Tools',
    value: 'process-and-ports',
    description: 'Tools related to port and process'
  },
  {
    title: 'Docker Tools',
    value: 'docker',
    description: 'Some handy tools for docker'
  },
  {
    title: 'Network Tools',
    value: 'network',
    description: 'Network related handy tools'
  },
  { title: 'Utilities', value: 'utility', description: 'Some other utilities' }
];

const titles = choices.map(ele => ele.title);

const promptOpt: prompts.PromptObject = {
  type: 'autocomplete',
  name: 'operation',
  message: 'Where do you wanna go?',
  suggest(input: any) {
    const results = fuzzy.filter(input, titles);
    const filteredIndices = results.map(ele => ele.index);
    return choices.filter((choice, index) => filteredIndices.includes(index)) as any;
  },
  choices
};

const ask = async () => {
  const response = await prompts(promptOpt, { onCancel: process.exit as any });
  return response;
};

const utils = {
  getConfirmation(message: string) {
    return prompts(
      {
        type: 'confirm',
        name: 'confirmed',
        message,
        initial: true
      },
      { onCancel: process.exit as any }
    );
  }
};

class CrossTools extends Command {
  /* constructor() {
      console.log(arguments);
      // super([...arguments]);
      // console.log('from constructor');
  }*/

  async run() {
    await this.bootApp();
    const { operation } = await ask();

    switch (operation) {
      case 'process-and-ports':
        await ProcessAndPorts.run();
        break;
      case 'docker':
        await DockerTools.run();
        break;
      case 'network':
        await Network.run();
        break;
      case 'utility':
        await Utility.run();
        break;
      default:
        console.log(colors.cyan('Oops. Hopefully next time'));
        break;
    }
  }

  private async bootApp() {
    const spinner = ora('Checking for updates');

    process.on('exit', () => {
      console.log(colors.cyan('Bye 👋'));
    });

    const pkgName = 'cross-tools';

    spinner.start(`Checking for local installation`);
    // cli.action.start(`Checking for local installation`, 'initializing', {stdout: true})
    // const output = shell.exec('npm list -g --depth=0 --json', { silent: true }).stdout;
    const output: any = await execAsync('npm list -g --depth=0 --json', { silent: true });
    spinner.stop();
    // cli.action.stop();
    console.log(output);
    const installed = JSON.parse(output).dependencies[pkgName];
    if (!installed) {
      const { confirmed } = await utils.getConfirmation(`Do you want to create this package locally?
  ${colors.yellow(`(By doing so, you don't have to download it on every execution.)`)}`);
      if (confirmed) {
        spinner.start(`Installing ${pkgName} locally`);
        shell.exec(`npm i -g ${pkgName}@latest`, { silent: true }); // check for user input (like pass)
        spinner.stop();
      }
    } else {
      spinner.start(`Current Version: ${colors.yellow(`v${installed.version}`)}. Checking for update...`);
      const output = shell.exec(`npm show ${pkgName} time --json`, {
        silent: true
      }).stdout;
      spinner.stop();
      const latestVersion = Object.keys(JSON.parse(output)).reverse()[0];
      const hasUpdaate = semver.gt(latestVersion, installed.version);
      if (hasUpdaate) {
        const { confirmed } = await utils.getConfirmation(`There is an update available ${colors.yellow(`(v${latestVersion})`)}. Do you want to update it now?`);
        if (confirmed) {
          spinner.text = `Updating ${pkgName}`;
          spinner.start();
          shell.exec(`npm i -g ${pkgName}@latest`, { silent: true });
          spinner.stop();
          console.log(colors.green(`✅ ${pkgName} updated to v${latestVersion}. ${colors.yellow('(Will be affected next time)')}\n`));
        }
      }
    }
  }
}

function execAsync(cmd: any, opts: any = {}) {
  return new Promise(function(resolve, reject) {
    // Execute the command, reject if we exit non-zero (i.e. error)
    shell.exec(cmd, opts, function(code: any, stdout: any, stderr: any) {
      if (code != 0) return reject(new Error(stderr));
      return resolve(stdout);
    });
  });
}
export = CrossTools;
