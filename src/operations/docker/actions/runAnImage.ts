import { BaseDockerAction } from '@app/operations/docker/baseDockerAction';
import { askFuzzy } from '@app/util/myPrompts';
import shellExecAsync from '@app/util/shellExecAsync';

// d run --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=developer -d mysql
const map = {
  ['MySQL']: `docker run --name mysql-cross-tools -p 3306:3306 -e MYSQL_ROOT_PASSWORD=developer -d mysql:5.7`,
  ['PostgreSQL']: `docker run --name postgres-cross-tools -p 5432:5432 -e POSTGRES_PASSWORD=developer -d postgres`,
};

class DockerAction extends BaseDockerAction {
  cmd = 'run-an-image';

  async handle() {
    const choices = Object.keys(map).map(key => ({
      title: key,
      value: key,
    }));
    const { operation } = await askFuzzy(choices, {});
    console.log(operation);

    // const image = 'MySQL';
    // await shellExecAsync(map[image], {}, { loadingMsg: 'Initializing Container...' });
  }
}

export default new DockerAction();
