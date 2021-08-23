import { BaseDockerAction } from '@app/operations/docker/baseDockerAction';

// d run --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=developer -d mysql
const map = {
  ['MySQL']: {
    image: 'mysql',
    containerName: 'mysql',
    hostPort: '3306',
    password: 'developer',
  },
};

class DockerAction extends BaseDockerAction {
  cmd = 'run-an-image';

  async handle() {
    const image = 'mysql';
    const data = await this.docker.searchImages(image);
    console.log(data);
    const option = map.MySQL;

    // this.docker.run(option.image, [], process.stdout, )

    // const info = await this.getDockerInfo();
    // console.log(info);
  }
}

export default new DockerAction();
