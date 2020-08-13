import shell from 'shelljs';
import asyncLoader from './asyncLoader';

const shellExecAsync = (cmd: string, opts: shell.ExecOptions = {}, customOpts = { loadingMsg: 'Loading...' }): Promise<string> => {
  const promise = () =>
    new Promise(function (resolve, reject) {
      // Execute the command, reject if we exit non-zero (i.e. error)
      shell.exec(cmd, opts, function (code: number, stdout: string, stderr: string) {
        if (code != 0) return reject(new Error(stderr));
        return resolve(stdout);
      });
    });

  return asyncLoader(promise, customOpts.loadingMsg);
};

export default shellExecAsync;
