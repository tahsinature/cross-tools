import { Command } from '@oclif/command';
import colors from 'colors';
import prompts from 'prompts';
import * as fuzzy from 'fuzzy';

import ProcessAndPorts from './operations/processAndPorts';
import DockerTools from './operations/docker';
import Network from './operations/network';
import Utility from './operations/utility';

import semver from 'semver';
import shellExecAsync from './util/shellExecAsync';

const choices = [
  {
    title: 'Process & Port Tools',
    value: 'process-and-ports',
    description: 'Tools related to port and process',
  },
  {
    title: 'Docker Tools',
    value: 'docker',
    description: 'Some handy tools for docker',
  },
  {
    title: 'Network Tools',
    value: 'network',
    description: 'Network related handy tools',
  },
  { title: 'Utilities', value: 'utility', description: 'Some other utilities' },
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
  choices,
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
        initial: true,
      },
      { onCancel: () => process.exit() }
    );
  },
};

class CrossTools extends Command {
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
    process.on('exit', () => {
      console.log(colors.cyan('Bye 👋'));
    });

    const pkgName = 'cross-tools';

    const output: any = await shellExecAsync('npm list -g --depth=0 --json', { silent: true }, { loadingMsg: 'Checking for local installation' });
    const installed = JSON.parse(output).dependencies[pkgName];
    if (!installed) {
      const { confirmed } = await utils.getConfirmation(`Do you want to create this package locally?
  ${colors.yellow(`(By doing so, you don't have to download it on every execution.)`)}`);
      if (confirmed) {
        await shellExecAsync(`npm i -g ${pkgName}@latest`, { silent: true }, { loadingMsg: `Installing ${pkgName} locally` }); // check for user input (like pass)
      }
    } else {
      const output: any = await shellExecAsync(
        `npm show ${pkgName} time --json`,
        { silent: true },
        { loadingMsg: `Current Version: ${colors.yellow(`v${installed.version}`)}. Checking for update...` }
      );
      const latestVersion = Object.keys(JSON.parse(output)).reverse()[0];
      const hasUpdaate = semver.gt(latestVersion, installed.version);
      if (hasUpdaate) {
        const { confirmed } = await utils.getConfirmation(`There is an update available (${colors.yellow(`v${installed.version} -> v${latestVersion}`)}). Do you want to update it now?`);
        if (confirmed) {
          await shellExecAsync(`npm i -g ${pkgName}@latest`, { silent: true }, { loadingMsg: `Updating ${pkgName}` });
          console.log(colors.green(`✅ ${pkgName} updated to v${latestVersion}. ${colors.yellow('(Will be affected next time)')}\n`));
        }
      }
    }
  }
}

export = CrossTools;
