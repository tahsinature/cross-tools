import { BaseDockerAction } from '@app/operations/docker/baseDockerAction';

class DockerAction extends BaseDockerAction {
  cmd = 'remove-all-volumes';

  async handle() {
    let totalRemoved = 0;
    const exec = async () => {
      const beforeExecVolumes = await this.docker.listVolumes();
      await this.docker.pruneVolumes();
      const afterExecVolumes = await this.docker.listVolumes();
      totalRemoved = beforeExecVolumes.Volumes.length - afterExecVolumes.Volumes.length;
    };

    await this.asyncLoader(exec, 'Removing all unnecessary volumes');

    const msg = this.colors.cyan(`✅ total ${totalRemoved}: volume(s) removed.`);
    console.log(msg);
  }
}

export default new DockerAction();
