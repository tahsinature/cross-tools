import { Command } from '@oclif/command';
import { askFuzzy, askTextInput } from '@app/util/myPrompts';
import open from 'open';
import PhoneNumber from 'awesome-phonenumber';

const choices = [
  {
    title: 'Send whatsapp message',
    value: 'send-whatsapp-msg',
    description: 'It allows you to send whwatsapp message without saving the contact nubmer.',
  },
];

class Miscellaneous extends Command {
  async run() {
    const { operation } = await askFuzzy(choices, {});

    switch (operation) {
      case 'send-whatsapp-msg':
        await this.sendWhatsMsg();
        break;

      default:
        break;
    }
  }

  async sendWhatsMsg() {
    while (true) {
      let { userInput } = await askTextInput({ message: 'Input destination phone number' });

      userInput = userInput.split(' ').join('');

      if (!userInput.startsWith('+')) userInput = `+${userInput}`;

      const pn = new PhoneNumber(userInput);
      let final = pn.getNumber('e164');
      if (!pn.isValid()) {
        console.error(`not a valid phone: ${final}`);
        continue;
      }

      const url = `https://api.whatsapp.com/send?phone=${final}`;

      open(url);
    }
  }
}

export default Miscellaneous;
