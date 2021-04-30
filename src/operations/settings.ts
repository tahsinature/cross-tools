import { Command } from '@oclif/command';
import { askFuzzy } from '../util/myPrompts';
import checkForUpdate from '@app/util/checkForUpdate';

const choices = [{ title: 'Check for update', value: 'check-for-update' }];

class Settings extends Command {
  async run() {
    console.clear();
    const { operation } = await askFuzzy(choices, {});

    switch (operation) {
      case 'check-for-update':
        await checkForUpdate();
        await this.run();
        break;

      default:
        break;
    }
  }
}

export default Settings;
