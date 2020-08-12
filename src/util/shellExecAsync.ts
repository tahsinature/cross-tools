import shell from 'shelljs';
import ora from 'ora';

const shellExecAsync = (cmd: string, opts: shell.ExecOptions = {}, customOpts = { loadingMsg: 'Loading...' }): Promise<string> => {
  return new Promise(function (resolve, reject) {
    const spinner = ora(customOpts.loadingMsg);
    spinner.start();
    // Execute the command, reject if we exit non-zero (i.e. error)
    shell.exec(cmd, opts, function (code: number, stdout: string, stderr: string) {
      spinner.stop();
      if (code != 0) return reject(new Error(stderr));
      return resolve(stdout);
    });
  });
};

export default shellExecAsync;
