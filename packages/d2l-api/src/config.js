const nodeEnv = process.env.NODE_ENV || 'development';

const defaultConfig = {
  listenPort: 4000,

  cookieMaxAge: 60 * 60 * 1000,
};

const configsByEnv = {
  production: {
    listenPort: 2020,

    cookieMaxAge: 365 * 24 * 60 * 60 * 1000,
  },
};

const configForEnv = configsByEnv[nodeEnv];

let localConfig = {}; // TODO: Read this from local file
const localConfigFile = `${require('os').homedir()}/.config/d2l-api-config.js`;
try {
  localConfig = require(localConfigFile);
  console.log(`Adding local config from ${localConfigFile}`);
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log(`Not adding local config from ${localConfigFile}`);
  } else {
    console.warn(`Failed to read local config file ${localConfigFile}:`, error);
  }
}

const config = {
  ...defaultConfig,
  ...configForEnv,
  ...localConfig,

  // Some other useful exports
  inDevelopment: nodeEnv.match(/development|testing/),
  inProduction: nodeEnv.match(/staging|production/),
};

module.exports = config;
