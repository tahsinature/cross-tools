import { Command, flags } from "@oclif/command";
import colors from "colors";
import prompts from "prompts";
import ProcessAndPorts from "./operations/processAndPorts";
import DockerTools from "./operations/docker";
import Network from "./operations/network";
import * as fuzzy from "fuzzy";

const choices = [
  { title: "Process & Port Tools", value: "process-and-ports", description: "Tools related to port and process" },
  { title: "Docker Tools", value: "docker", description: "Some handy tools for docker" },
  { title: "Network Tools", value: "network", description: "Network related handy tools" },
];

const titles = choices.map((ele) => ele.title);

const promptOpt: prompts.PromptObject = {
  type: "autocomplete",
  name: "operation",
  message: "Where do you wanna go?",
  suggest(input: any) {
    const results = fuzzy.filter(input, titles);
    const filteredIndices = results.map((ele) => ele.index);
    return choices.filter((choice, index) => filteredIndices.includes(index)) as any;
  },
  choices,
};

const ask = async () => {
  const response = await prompts(promptOpt, { onCancel: process.exit as any });
  return response;
};

class CrossTools extends Command {
  async run() {
    process.on("exit", () => {
      console.log(colors.cyan("Bye 👋"));
    });

    const { operation } = await ask();

    switch (operation) {
      case "process-and-ports":
        await ProcessAndPorts.run();
        break;
      case "docker":
        await DockerTools.run();
        break;
      case "network":
        await Network.run();
        break;
      default:
        console.log(colors.cyan("Oops. Hopefully next time"));
        break;
    }
  }
}

export = CrossTools;
