import { Command } from '@oclif/command';
import prompts from 'prompts';
import colors from 'colors';
import Docker from 'dockerode';
import asyncLoader from '@app/util/asyncLoader';

const askOperation = () => {
  return prompts(
    {
      type: 'autocomplete',
      name: 'operation',
      message: 'Select an operation',
      choices: [
        { title: 'Select containers', value: 'select-containers', description: 'List, view & take action' },
        { title: 'Remove all containers', value: 'remove-all-containers', description: 'Both running & stopped' },
        { title: 'Remove all volumes', value: 'remove-all-volumes', description: 'Unnecessary volumes will be removed' },
        { title: 'Get my docker info', value: 'get-my-docker-info', description: 'Details of running docker instance' },
      ],
    },
    { onCancel: () => process.exit() }
  );
};

const pickContaniers = (containers: Docker.ContainerInfo[]) => {
  return prompts(
    {
      type: 'autocompleteMultiselect',
      name: 'selectedContainers',
      hint: 'green names are running containers',
      message: 'Select the containers you wanna deal with',
      min: 1,
      choices: containers.map((container: any) => ({
        title: `${colors[container.State === 'running' ? 'green' : 'red'](container.Names[0])}`,
        value: container,
        message: 'test',
        description: 'test desc',
      })),
    },
    { onCancel: () => process.exit() }
  );
};

const askContainersAction = () => {
  return prompts(
    {
      type: 'autocomplete',
      name: 'containerAction',
      message: 'Select an action',
      choices: [
        { title: 'Start', value: 'start', description: 'Start selected containers. (already running containrs will be skipped)' },
        { title: 'Stop', value: 'stop', description: 'Stop selected containers. (already stopped containrs will be skipped)' },
        { title: 'Remove', value: 'remove', description: 'Remove (forced) selected containers' },
        { title: 'Restart', value: 'restart', description: 'Restart / Start (if stopped) selected containers' },
      ],
    },
    { onCancel: () => process.exit() }
  );
};

class DockerTools extends Command {
  docker = new Docker();
  async run() {
    const isDockerRunning = await this.getDockerInfo();
    if (!isDockerRunning) return console.log(colors.red('Docker is not running.'));

    const { operation } = await askOperation();

    const containers = await this.docker.listContainers({ all: true });
    switch (operation) {
      case 'select-containers':
        if (!containers.length) return console.log(colors.red('No containers found'));

        const selectedContainers: Docker.ContainerInfo[] = (await pickContaniers(containers)).selectedContainers;
        if (!selectedContainers) {
          console.log(colors.red('No containers selected'));
          process.exit(1);
        }

        const { containerAction } = await askContainersAction();
        this.execContainersAction(selectedContainers, containerAction);
        break;

      case 'remove-all-containers':
        if (!containers.length) return console.log(colors.red('No containers found'));
        await this.execContainersAction(containers, 'remove');
        break;

      case 'remove-all-volumes':
        this.removeAllVolumeAction();
        break;

      case 'get-my-docker-info':
        const info = await this.getDockerInfo();
        console.log(info);
        break;

      default:
        break;
    }
  }

  async removeAllVolumeAction() {
    let totalRemoved = 0;
    const exec = async () => {
      const beforeExecVolumes = await this.docker.listVolumes();
      await this.docker.pruneVolumes();
      const afterExecVolumes = await this.docker.listVolumes();
      totalRemoved = beforeExecVolumes.Volumes.length - afterExecVolumes.Volumes.length;
    };

    await asyncLoader(exec, 'Removing all unnecessary volumes');

    const msg = colors.cyan(`✅ total ${totalRemoved}: volume(s) removed.`);
    console.log(msg);
  }

  async execContainersAction(containers: Docker.ContainerInfo[], action: 'start' | 'stop' | 'remove' | 'restart') {
    for (const containerDetails of containers) {
      const msgBefore = `Performing [${action}] container`;
      const msg = colors.cyan(`✅ action: ${colors.bold(action)}. container: ${containerDetails.Names[0]}`);
      let getPromise: () => Promise<any>;

      switch (action) {
        case 'start':
          getPromise = () => new Promise((res, rej) => this.docker.getContainer(containerDetails.Id).start().then(res).catch(rej));
          await asyncLoader(getPromise, msgBefore);
          break;
        case 'stop':
          getPromise = () => new Promise((res, rej) => this.docker.getContainer(containerDetails.Id).stop().then(res).catch(res)); // always resolving (for getting success response if containers already stopped)
          await asyncLoader(getPromise, msgBefore);
          break;
        case 'remove':
          getPromise = () => new Promise((res, rej) => this.docker.getContainer(containerDetails.Id).remove({ force: true }).then(res).catch(rej));
          await asyncLoader(getPromise, msgBefore);
          break;
        case 'restart':
          getPromise = () => new Promise((res, rej) => this.docker.getContainer(containerDetails.Id).restart().then(res).catch(rej));
          await asyncLoader(getPromise, msgBefore);
          break;

        default:
          console.log(colors.red('container action not supported'));
      }

      console.log(msg);
    }
  }

  async getDockerInfo() {
    return new Promise(res => {
      this.docker
        .info()
        .then(res)
        .catch(() => res(false));
    });
  }
}

export default DockerTools;
