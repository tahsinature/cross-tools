"use strict";const tslib_1=require("tslib"),command_1=require("@oclif/command"),colors_1=tslib_1.__importDefault(require("colors")),prompts_1=tslib_1.__importDefault(require("prompts")),processAndPorts_1=tslib_1.__importDefault(require("./operations/processAndPorts")),docker_1=tslib_1.__importDefault(require("./operations/docker")),network_1=tslib_1.__importDefault(require("./operations/network")),fuzzy=tslib_1.__importStar(require("fuzzy")),shelljs_1=tslib_1.__importDefault(require("shelljs")),ora_1=tslib_1.__importDefault(require("ora")),choices=[{title:"Process & Port Tools",value:"process-and-ports",description:"Tools related to port and process"},{title:"Docker Tools",value:"docker",description:"Some handy tools for docker"},{title:"Network Tools",value:"network",description:"Network related handy tools"}],titles=choices.map(e=>e.title),promptOpt={type:"autocomplete",name:"operation",message:"Where do you wanna go?",suggest(e){const o=fuzzy.filter(e,titles).map(e=>e.index);return choices.filter((e,t)=>o.includes(t))},choices:choices},ask=async()=>await prompts_1.default(promptOpt,{onCancel:process.exit}),utils={getConfirmation:e=>prompts_1.default({type:"confirm",name:"confirmed",message:e,initial:!0},{onCancel:process.exit})};class CrossTools extends command_1.Command{async run(){const e=ora_1.default("Loading unicorns");process.on("exit",()=>{console.log(colors_1.default.cyan("Bye 👋"))});const o="cross-tools",t=shelljs_1.default.exec("npm list -g --depth=0 --json",{silent:!0}).stdout;if(JSON.parse(t).dependencies[o]){const t=shelljs_1.default.exec(`npm show ${o} time --json`,{silent:!0}).stdout,s=Object.keys(JSON.parse(t)).reverse()[0];if(!0){const{confirmed:t}=await utils.getConfirmation("There is an update available. Do you want to update it now?");t&&(e.text="Updating "+o,e.start(),shelljs_1.default.exec("npm i -g "+o,{silent:!0}),e.stop(),console.log(colors_1.default.green(`✅ ${o} updated to v${s}. ${colors_1.default.yellow("(Will be affected next time)")}\n`)))}}else{const{confirmed:e}=await utils.getConfirmation("Do you want to create this package globally?\n      "+colors_1.default.yellow("(By doing that so, you don't have to download it on every execution.)"))}const{operation:s}=await ask();switch(s){case"process-and-ports":await processAndPorts_1.default.run();break;case"docker":await docker_1.default.run();break;case"network":await network_1.default.run();break;default:console.log(colors_1.default.cyan("Oops. Hopefully next time"))}}}module.exports=CrossTools;