import { Command } from "@oclif/command";
import internalIp from "internal-ip";
import publicIp from "public-ip";

// internalIp.v4().then(console.log);
// publicIp.v4().then(console.log);

// get your ip details
// ssh
class Network extends Command {
  async run() {
    console.log("network tools");
  }
}

export default Network;
