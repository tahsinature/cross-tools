import prompts from "prompts";
import fuzzy from "fuzzy";
import { Command } from "@oclif/command";
import colors from "colors";
import Check from "./check";
import http from "http";
import os from "os";
import detect from "detect-port";
import findProcess from "find-process";

const choices = [
  { title: "Process Killer (By Port)", value: "kill-process-by-port", description: "Kill process by port" },
  { title: "Process Killer (By Pid)", value: "kill-by-pid", description: "Kill process by pid" },
  { title: `List Listening Ports ${colors.red("(Beta)")}`, value: "list-listening-port", description: "Currently works only with macOS" },
  { title: `Port Checker ${colors.red("(Beta)")}`, value: "port-check", description: "Currently works only with macOS" },
  { title: "Create Server", value: "start-server", description: "Listen to a port by creating a small server" },
];

const titles = choices.map((ele) => ele.title);

const ask = async () => {
  return prompts(
    {
      type: "autocomplete",
      name: "operation",
      message: "What do you want to do?",
      suggest(input, choicesState) {
        const results = fuzzy.filter(input, titles);
        const filteredIndices = results.map((ele) => ele.index);
        return choices.filter((choice, index) => filteredIndices.includes(index)) as any;
      },
      choices,
    },
    { onCancel: process.exit as any }
  );
};

const utils = {
  killPid(pid: any) {
    const errorCodes: any = {
      // official - https://pubs.opengroup.org/onlinepubs/9699919799/functions/kill.html
      EINVAL: "The value of the sig argument is an invalid or unsupported signal number.",
      EPERM: "The process does not have permission to send the signal to any receiving process.",
      ESRCH: "No process or process group can be found corresponding to that specified by pid.",
      // custom
      ERR_INVALID_ARG_TYPE: "Invalid pid",
    };
    try {
      process.kill(pid);
      console.log(colors.green("Process killed"));
    } catch (error) {
      console.log(colors.red(errorCodes[error.code]));
    }
  },
};

class ProcessAndPorts extends Command {
  async run() {
    const { operation } = await ask();

    switch (operation) {
      case "kill-process-by-port":
        await this.killByPort();
        break;

      case "list-listening-port":
        await this.listListeningPorts();
        break;

      case "start-server":
        await this.startServer();
        break;

      case "port-check":
        await Check.run();
        break;

      case "kill-by-pid":
        await this.killByPid();
        break;

      default:
        console.log(colors.red("No operation selected"));
        break;
    }
  }

  async killByPort() {
    // `System Ports (0-1023), User Ports (1024-49151), and the Dynamic and/or Private Ports (49152-65535)`;
    const { port } = await prompts(
      {
        name: "port",
        type: "number",
        min: 1,
        max: 65535,
        message: `Please enter the port number to find the process`,
        validate: async (port) => {
          const p = await findProcess("port", port);
          return p.length ? true : "No process found with this port";
        },
      },
      { onCancel: process.exit as any }
    );

    const [{ cmd, pid }] = await findProcess("port", port);

    const { sure } = await prompts(
      {
        name: "sure",
        type: "confirm",
        message: `kill ${colors.cyan(cmd)}?`,
        initial: true,
      },
      { onCancel: process.exit as any }
    );

    if (sure) utils.killPid(pid);
  }

  async listListeningPorts() {
    const listProcesses = (list: any) => {
      return prompts(
        {
          type: "autocompleteMultiselect",
          name: "pids",
          message: "Pick the processes you wanna kill",
          choices: list.map((ele: any) => ({ title: `${ele.name} (${ele.addr})`, value: ele.pid })),
          hint: "If you want to kill by PID, don't select any process from suggestion and type the pid",
          min: 1,
        },
        { onCancel: process.exit as any }
      );
    };
    // const check = new Check();
    // const data = check.getListeningPortsData();
    // const { pids } = await listProcesses(data);

    // console.log(`these pids have been selected ${pids}`);
  }

  async startServer() {
    const askName = () => {
      return prompts(
        {
          name: "name",
          type: "text",
          initial: os.userInfo().username,
          message: "Enter a name to say hello",
        },
        { onCancel: process.exit as any }
      );
    };

    const askPort = () => {
      return prompts(
        {
          name: "port",
          type: "number",
          min: 1,
          max: 65535,
          message: "Enter port that you want to listen to (1 - 65535)",
          validate: async (port) => {
            if (!port) return `Please enter a port`;
            const suggestion = await detect(port);
            return suggestion === port || `Port is busy or should not use, suggested: ${colors.cyan(suggestion as any)}`;
          },
        },
        { onCancel: process.exit as any }
      );
    };

    const { port } = await askPort();
    const { name } = await askName();
    const server = this.getServer(name);
    server.listen(port, () => {
      console.log(`Listening on port ${colors.green(port)}
pid: ${colors.dim(process.pid as any)}
${colors.gray(`http://0.0.0.0:${port}`)}
${colors.gray(`http://localhost:${port}`)}
`);
    });
  }

  async killByPid() {
    const askPid = () => {
      return prompts(
        {
          type: "number",
          name: "pid",
          message: "Type the pid you wanna kill",
          style: "default",
          min: 1,
        },
        { onCancel: process.exit as any }
      );
    };
    const { pid } = await askPid();
    if (!pid) {
      console.log(colors.red("No pid given!"));
      process.exit(1);
    }
    utils.killPid(pid);
  }

  getServer(name: string) {
    return http.createServer(function (req, res) {
      // var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
      // console.log(ip);
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.write(`Hello ${name}!`);
      res.end();
    });
  }
}

export default ProcessAndPorts;
