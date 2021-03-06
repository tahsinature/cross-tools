import { Command } from '@oclif/command';
import prompts from 'prompts';
import pidusage from 'pidusage';
import Table from 'cli-table';
import shellExecAsync from '@app/util/shellExecAsync';

const listProcesses = (list: any) => {
  return prompts(
    {
      type: 'autocompleteMultiselect',
      name: 'pids',
      message: 'Pick a process',
      choices: list.map((ele: any) => ({ title: `${ele.name} (${ele.addr})`, value: ele.pid })),
      min: 1,
    },
    { onCancel: () => process.exit() }
  );
};

class Check extends Command {
  async run() {
    const data = await this.getListeningPortsData();
    const { pids } = await listProcesses(data);

    const processDetails: any = await pidusage(pids);
    const table = new Table({ head: Object.keys(Object.values(processDetails)[0] as any) });
    for (const process in processDetails) {
      table.push(Object.values(processDetails[process]));
    }

    console.log(table.toString());
  }

  async getListeningPortsData() {
    /**
     * rapportd 385 *:49213
     * rapportd 385 *:49213
     */
    let data: any = await shellExecAsync("lsof -nP +c 15 | grep LISTEN | awk '{print($1,$2,$9)}'", { silent: true });

    /**
     *  [
     *    'rapportd 385 *:49213',
     *    'rapportd 385 *:49213',
     *    ""
     *  ]
     */
    data = data.split('\n').map((ele: any) => ele);

    /**
     *  [
     *    'rapportd 385 *:49213',
     *    'rapportd 385 *:49213',
     *  ]
     */
    data = data.filter((ele: any) => ele.split(' ').length === 3);

    /**
     *  [
     *    ['rapportd, 385, *:49213'],
     *    ['rapportd, 385, *:49213']
     *  ]
     */
    data = data.map((ele: any) => ele.split(' '));

    /**
     *  [
     *    { name: 'rapportd', pid: '385', addr: '*:49213' },
     *    { name: 'rapportd', pid: '385', addr: '*:49213' }
     *  ]
     */
    data = data.map((ele: any) => ({ name: ele[0], pid: ele[1], addr: ele[2] }));
    return data;
  }
}

export default Check;
