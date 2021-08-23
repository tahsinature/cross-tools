import { Command } from '@oclif/command';
import colors from 'colors';
import prompts from 'prompts';
import * as fuzzy from 'fuzzy';
import ProcessAndPorts from '@app/operations/processAndPorts';
import DockerTools from '@app/operations/docker';
import Network from '@app/operations/network';
import Utility from '@app/operations/utility';
import Settings from '@app/operations/settings';
import Miscellaneous from '@app/operations/miscellaneous';

const choices = [
  { title: 'Process & Port Tools', value: 'process-and-ports', description: 'Tools related to port and process' },
  { title: 'Docker Tools', value: 'docker', description: 'Some handy tools for docker' },
  { title: 'Network Tools', value: 'network', description: 'Network related handy tools' },
  { title: 'Utilities', value: 'utility', description: 'Some other utilities' },
  { title: 'Miscellaneous', value: 'miscellaneous', description: 'Some other miscellaneous tools' },
  { title: 'Settings', value: 'settings', description: 'Configure your cross-tools' },
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

class CrossTools extends Command {
  async run() {
    console.clear();
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
      case 'settings':
        await Settings.run();
        break;
      case 'miscellaneous':
        await Miscellaneous.run();
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
  }
}

export = CrossTools;
