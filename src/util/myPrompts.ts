import prompts from 'prompts';
import * as fuzzy from 'fuzzy';
import _ from 'lodash';

interface IChoice {
  title: string;
  value: any;
  disabled?: boolean;
  selected?: boolean;
  description?: string;
}

interface IOption {
  message?: string;
}

export const askFuzzy = (choices: IChoice[], option: IOption) => {
  const titles = choices.map(ele => ele.title);

  return prompts(
    {
      type: 'autocomplete',
      name: 'operation',
      message: option.message || 'Select an operation',
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

export function askAutoCompleteMultiSelect(choices: IChoice[], option?: IOption) {
  return prompts(
    {
      type: 'autocompleteMultiselect',
      name: 'selectedItems',
      message: option?.message || 'Select...',
      choices,
      min: 1,
    },
    { onCancel: () => process.exit() }
  );
}

export const getConfirmation = (message: string) => {
  return prompts(
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      initial: true,
    },
    { onCancel: () => process.exit() }
  );
};
