const secrets = require(`./secrets.js`);
const envSecrets = secrets[process.env.NODE_ENV];

const config = {
  app: {
    port: 80
    , useHttps: true
  }
  , buildPath: '../web/build'

  , session: {
    secret: envSecrets.sessionSecret
  }

  , database: {
    dbName: `yoteAi-prod`
  }

  , externalApis: {
    mandrill: {
      apiKey: envSecrets.mandrill
    }
  }

};

module.exports = config;