export default (numOfSec: number): Promise<void> => {
  return new Promise(res => {
    setTimeout(() => {
      res();
    }, numOfSec * 1000);
  });
};
