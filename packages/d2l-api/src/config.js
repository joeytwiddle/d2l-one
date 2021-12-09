const nodeEnv = process.env.NODE_ENV || 'development';

const defaultConfig = {
  cookieMaxAge: 60 * 1000,
};

const configsByEnv = {
  production: {
    cookieMaxAge: 365 * 24 * 60 * 60 * 1000,
  },
};

const configForEnv = configsByEnv[nodeEnv];

const localConfig = {}; // TODO: Read this from local file

const config = {
  ...defaultConfig,
  ...configForEnv,
  ...localConfig,

  // Some other useful exports
  inDevelopment: nodeEnv.match(/development|testing/),
  inProduction: nodeEnv.match(/staging|production/),
};

module.exports = config;
