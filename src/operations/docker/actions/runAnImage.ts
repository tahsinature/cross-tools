import { BaseDockerAction } from '@app/operations/docker/baseDockerAction';
import { askFuzzy } from '@app/util/myPrompts';
import shellExecAsync from '@app/util/shellExecAsync';

const map = {
  ['MySQL']: {
    cmd: `docker run --name mysql-cross-tools -p 3306:3306 -e MYSQL_ROOT_PASSWORD=developer -d mysql:5.7`,
    display: {
      port: '3306',
      user: 'root',
      pass: 'developer',
      version: 'mysql:5.7',
    },
  },
  ['PostgreSQL']: {
    cmd: `docker run --name postgres-cross-tools -p 5432:5432 -e POSTGRES_PASSWORD=developer -d postgres:alpine`,
    display: {
      port: '3306',
      user: 'root',
      pass: 'developer',
      version: 'mysql:5.7',
    },
  },
};

class DockerAction extends BaseDockerAction {
  cmd = 'run-an-image';

  async handle() {
    const choices = Object.keys(map).map(key => ({
      title: key,
      value: key,
    }));

    const { operation } = await askFuzzy(choices, {});
    const { cmd, display } = (map as any)[operation];

    await shellExecAsync(cmd, { silent: true });
    console.log(display);
  }
}

export default new DockerAction();
