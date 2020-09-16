import { Command } from '@oclif/command';
import { askFuzzy } from '../util/myPrompts';
import config from '@app/config';
import prompts from 'prompts';

const choices = [
  { title: 'Update check frequency', value: 'update-check-frequency' },
  { title: 'Check for local installation', value: 'check-for-local-installation' },
];

class Settings extends Command {
  async run() {
    const { operation } = await askFuzzy(choices, {});

    switch (operation) {
      case 'update-check-frequency':
        const { updateCheckIntervalInDays } = await prompts(
          {
            type: 'number',
            name: 'updateCheckIntervalInDays',
            message: 'How often should check for updates? (For this option, check for local installation needs to be enabled)',
            max: 7,
            min: 0,
            float: false,
            initial: config.state.updateCheckIntervalInDays,
          },
          { onCancel: () => process.exit() }
        );
        config.update('updateCheckIntervalInDays', updateCheckIntervalInDays);
        await this.run();
        break;

      case 'check-for-local-installation':
        const { checkForLocalInstallationOnBoot } = await prompts(
          {
            type: 'confirm',
            name: 'checkForLocalInstallationOnBoot',
            message: 'During bootup checks if this app installed globally',
            initial: config.state.checkForLocalInstallationOnBoot,
          },
          { onCancel: () => process.exit() }
        );

        config.update('checkForLocalInstallationOnBoot', checkForLocalInstallationOnBoot);
        await this.run();
        break;

      default:
        break;
    }
  }
}

export default Settings;
