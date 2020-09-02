import path from 'path';
import os from 'os';
import fs from 'fs';
import Joi from 'joi';
import colors from 'colors';

const schema: any = {
  updateCheckIntervalInDays: Joi.number().required(),
  lastUpdateCheck: Joi.date().required(),
  checkForLocalInstallationOnBoot: Joi.boolean().required(),
};

class Config {
  private configFileName = 'config.json';
  private configFolderPath = path.join(os.homedir(), '.config', 'cross-tools');
  private configFilePath = path.join(this.configFolderPath, this.configFileName);

  state: any = {
    updateCheckIntervalInDays: 2,
    lastUpdateCheck: 0,
    checkForLocalInstallationOnBoot: true,
  };

  init() {
    if (!fs.existsSync(this.configFilePath)) this.sync();
    else {
      try {
        const configFromConfigFile = require(this.configFilePath);
        const { error } = Joi.object(schema).validate(configFromConfigFile);
        if (error) throw error;
        else this.state = configFromConfigFile;
      } catch (err) {
        console.log(err.message);

        console.log(colors.red(`Invalid configuration. Overwrittng with default configuration?`));
        fs.writeFileSync(this.configFilePath, JSON.stringify(this.state, null, 2));
      }
    }
  }

  public update(key: string, value: any) {
    if (!(key in schema)) throw new Error('unknown config requested');
    else {
      const { error } = schema[key].validate(value);
      if (error) throw error;
      this.state = { ...this.state, [key]: value };
      this.sync();
    }
  }

  private sync() {
    const { error } = Joi.object(schema).validate(this.state);
    if (error) throw error;

    fs.mkdirSync(this.configFolderPath, { recursive: true });
    fs.writeFileSync(this.configFilePath, JSON.stringify(this.state, null, 2));
  }
}

const config = new Config();

config.init();

export default config;
