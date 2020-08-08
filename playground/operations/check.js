"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const tslib_1=require("tslib"),command_1=require("@oclif/command"),prompts_1=tslib_1.__importDefault(require("prompts")),shell=tslib_1.__importStar(require("shelljs")),pidusage_1=tslib_1.__importDefault(require("pidusage")),cli_table_1=tslib_1.__importDefault(require("cli-table")),listProcesses=e=>prompts_1.default({type:"autocompleteMultiselect",name:"pids",message:"Pick a process",choices:e.map(e=>({title:`${e.name} (${e.addr})`,value:e.pid})),min:1},{onCancel:process.exit});class Check extends command_1.Command{async run(){const e=this.getListeningPortsData(),{pids:t}=await(s=e,prompts_1.default({type:"autocompleteMultiselect",name:"pids",message:"Pick a process",choices:s.map(e=>({title:`${e.name} (${e.addr})`,value:e.pid})),min:1},{onCancel:process.exit}));var s;const i=await pidusage_1.default(t),a=new cli_table_1.default({head:Object.keys(Object.values(i)[0])});for(const e in i)a.push(Object.values(i[e]));console.log(a.toString())}getListeningPortsData(){let e=shell.exec("lsof -nP +c 15 | grep LISTEN | awk '{print($1,$2,$9)}'",{silent:!0}).stdout;return e=e.split("\n").map(e=>e),e=e.filter(e=>3===e.split(" ").length),e=e.map(e=>e.split(" ")),e=e.map(e=>({name:e[0],pid:e[1],addr:e[2]})),e}}exports.default=Check;