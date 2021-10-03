import { BaseDockerAction } from '@app/operations/docker/baseDockerAction';

class DockerAction extends BaseDockerAction {
  cmd = 'remove-images';

  async handle(option: { untagged: boolean }) {
    let totalRemoved = 0;
    const exec = async () => {
      const images = await this.docker.listImages();

      const untagged = images.filter(image => !image.RepoTags || image.RepoTags[0] === '<none>:<none>');

      if (option.untagged)
        for (const image of untagged) {
          await this.docker.getImage(image.Id).remove({ force: { true: 'true' } });
          totalRemoved++;
        }
    };

    await this.asyncLoader(exec, 'Removing all untagged images');

    const msg = this.colors.cyan(`✅ total ${totalRemoved}: image(s) removed.`);
    console.log(msg);
  }
}

export default new DockerAction();
