import shellExecAsync from '@app/util/shellExecAsync';
import moment from 'moment';
import { getConfirmation } from '@app/util/myPrompts';
import config from '@app/config';
import semver from 'semver';
import colors from 'colors';

export default async () => {
  const pkgName = 'cross-tools';

  // if (!config.state.checkForLocalInstallationOnBoot) return;

  const output: any = await shellExecAsync('npm list -g --depth=0 --json', { silent: true }, { loadingMsg: 'Checking for local installation' });
  const installed = JSON.parse(output).dependencies[pkgName];
  if (!installed) {
    const { confirmed } = await getConfirmation(`Do you want to create this package locally?
${colors.yellow(`(By doing so, you don't have to download it on every execution.)`)}`);
    if (confirmed) {
      await shellExecAsync(`npm i -g ${pkgName}@latest`, { silent: true }, { loadingMsg: `Installing ${pkgName} locally` }); // check for user input (like pass)
    }
  } else {
    const output: any = await shellExecAsync(`npm show ${pkgName} time --json`, { silent: true }, { loadingMsg: `Current Version: ${colors.yellow(`v${installed.version}`)}. Checking for update...` });

    const latestVersion = Object.keys(JSON.parse(output)).reverse()[0];
    const hasUpdaate = semver.gt(latestVersion, installed.version);
    if (hasUpdaate) {
      const { confirmed } = await getConfirmation(`There is an update available (${colors.yellow(`v${installed.version} -> v${latestVersion}`)}). Do you want to update it now?`);
      if (confirmed) {
        await shellExecAsync(`npm i -g ${pkgName}@latest`, { silent: true }, { loadingMsg: `Updating ${pkgName}` });
        console.log(colors.green(`✅ ${pkgName} updated to v${latestVersion}. ${colors.yellow('(Will be affected next time)')}\n`));
      }
    } else console.log('already up to date');
  }
};
