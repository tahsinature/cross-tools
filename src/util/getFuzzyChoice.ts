import prompts from 'prompts';
import * as fuzzy from 'fuzzy';

interface IChoice {
  title: string;
  value: any;
  disabled?: boolean;
  selected?: boolean;
  description?: string;
}

const askFuzzy = (choices: IChoice[]) => {
  const titles = choices.map(ele => ele.title);

  return prompts(
    {
      type: 'autocomplete',
      name: 'operation',
      message: 'Select an operation',
      choices,
      suggest(input: any) {
        const results = fuzzy.filter(input, titles);
        const filteredIndices = results.map(ele => ele.index);
        return choices.filter((choice, index) => filteredIndices.includes(index)) as any;
      },
    },
    { onCancel: () => process.exit() }
  );
};

export default askFuzzy;
