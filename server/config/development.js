const secrets = require(`./secrets.js`);
const envSecrets = secrets[process.env.NODE_ENV];

const config = {
  session: {
    secret: envSecrets.sessionSecret
  }

  , database: {
    uri: `mongodb+srv://${envSecrets.mongo_user}:${envSecrets.mongo_pass}@fugitive-misc-clients.7uyof.mongodb.net/`
    , name: `yote`
  }

  , externalApis: {
    mandrill: {
      apiKey: envSecrets.mandrill
    }
  }
};

module.exports = config;