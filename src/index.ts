import { Command, flags } from "@oclif/command";
import colors from "colors";
import prompts from "prompts";
import ProcessAndPorts from "./operations/processAndPorts";
import DockerTools from "./operations/docker";
import Network from "./operations/network";
import * as fuzzy from "fuzzy";
import shell from "shelljs";
import semver from "semver";
import ora from "ora";

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

const utils = {
  getConfirmation(message: string) {
    return prompts(
      {
        type: "confirm",
        name: "confirmed",
        message,
        initial: true,
      },
      { onCancel: process.exit as any }
    );
  },
};

class CrossTools extends Command {
  async run() {
    const spinner = ora("Loading unicorns");

    process.on("exit", () => {
      console.log(colors.cyan("Bye 👋"));
    });

    const pkgName = "cross-tools";

    const output = shell.exec("npm list -g --depth=0 --json", { silent: true }).stdout;
    const installed = JSON.parse(output).dependencies[pkgName];
    if (!installed) {
      const { confirmed } = await utils.getConfirmation(`Do you want to create this package globally?
      ${colors.yellow(`(By doing that so, you don't have to download it on every execution.)`)}`);
    } else {
      const output = shell.exec(`npm show ${pkgName} time --json`, { silent: true }).stdout;
      const latestVersion = Object.keys(JSON.parse(output)).reverse()[0];
      // const hasUpdaate = semver.gt(latestVersion, installed.version);
      const hasUpdaate = true;
      if (hasUpdaate) {
        const { confirmed } = await utils.getConfirmation(`There is an update available. Do you want to update it now?`);
        if (confirmed) {
          spinner.text = `Updating ${pkgName}`;
          spinner.start();
          shell.exec(`npm i -g ${pkgName}`, { silent: true });
          spinner.stop();
          console.log(colors.green(`✅ ${pkgName} updated to v${latestVersion}. ${colors.yellow("(Will be affected next time)")}\n`));
        }
      }
    }
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
