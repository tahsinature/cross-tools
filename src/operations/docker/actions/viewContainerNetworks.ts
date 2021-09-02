import { BaseDockerAction } from '@app/operations/docker/baseDockerAction';

class DockerAction extends BaseDockerAction {
  cmd = 'view-containers-networks';

  async handle() {
    const exec = async () => {
      const nets = await this.docker.listNetworks();

      for (const i in nets) {
        const net = nets[i];
        const name = net.Name;
        console.log(`name: ${name}`);
        console.log(`driver: ${net.Driver}`);
        console.log(net.Containers);
        console.log(`=============`);
      }
    };

    exec();
  }
}

export default new DockerAction();
