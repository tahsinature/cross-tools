import ora from 'ora';

const asyncLoader = (asyncFn: () => Promise<any>, loadingMsg = 'Loading...'): Promise<any> => {
  return new Promise(async (res, rej) => {
    const spinner = ora(loadingMsg);
    spinner.start(loadingMsg);

    await asyncFn()
      .then(function () {
        spinner.stop();
        res([...arguments]);
      })
      .catch(err => {
        spinner.stop();
        rej(err);
      });
  });
};

export default asyncLoader;
