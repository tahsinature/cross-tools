import { Command } from '@oclif/command';
import defaultGateway from 'default-gateway';
import askFuzzy from '../util/getFuzzyChoice';
import ip from 'ip';
import axios from 'axios';

// ssh

const choices = [
  {
    title: 'Get my ip details',
    value: 'get-my-ip-details',
    description: 'Get details about your ip.',
  },
];

class Network extends Command {
  async run() {
    const { operation } = await askFuzzy(choices);

    switch (operation) {
      case 'get-my-ip-details':
        const details = await this.getMyIpDetails();
        console.log(details);
        break;

      default:
        break;
    }
  }

  async getMyIpDetails() {
    const details: any = {
      localIp: ip.address(),
    };

    await defaultGateway
      .v4()
      .then(data => {
        details.gateway = data;
      })
      .catch(err => {});

    await axios
      .get('https://freegeoip.app/json', {
        timeout: 2000,
      })
      .then(response => {
        details.publicIp = response.data;
      })
      .catch(err => {});

    return details;
  }
}

export default Network;
