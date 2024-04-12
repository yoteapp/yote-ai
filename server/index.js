// https://github.com/lorenwest/node-config
const config = require('config')
const env = process.env.NODE_ENV || 'development';


// open libraries
const express = require('express')
require('express-async-errors');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// yote libraries
const errorHandler = require('./global/handlers/errorHandler.js')
const { passport } = require('./global/handlers/passportHandler.js');

// on dev the build path points to web/dist, on prod it points to web/build
const buildPath = config.get('buildPath');

// init app
const app = express()

// setup express
app.use(express.static(path.join(__dirname, buildPath), {
  index: false
}));
app.set('views', path.join(__dirname, buildPath));
app.set('view engine', 'html');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());

// other config - cors, options

// connect to database
mongoose.connect(config.get('database.uri') + config.get('database.name'), {
    // mongoose has a lot of depreciation warnings: https://stackoverflow.com/questions/51916630/mongodb-mongoose-deprecation-warning
    useNewUrlParser: true
    , useUnifiedTopology: true
    , useCreateIndex: true
  }).catch(err => console.log("OUCHIE OOOO MY DB", err))

app.use(
  session({
    // secret: process.env.SECRET,
    secret: config.get('session.secret'),
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: config.get('database.uri') + config.get('database.name')
      // NOTES HERE - this functions but is NOT correct - connect-mongo changed their package
      // , and we SHOULD be able to pass in teh connection promise, as below, but it breaks. the temp solution creates unnecessary additional database connections
      // https://stackoverflow.com/questions/66388523/error-cannot-init-client-mongo-connect-express-session
      // https://www.npmjs.com/package/connect-mongo#express-or-connect-integration
      
      // correct way, re-use existing connection:
      // clientPromise: mongoose.connection
    })
  })
);

// passport
app.use(passport.initialize());
app.use(passport.session());

// api
let router = express.Router();
require('./global/api/router')(router, app)

app.use('/', router);

// unified error handler
app.use(errorHandler)

if(config.get('app.useHttps')) {
  require('https').createServer({
    minVersion: 'TLSv1.2'
    , key: fs.readFileSync(`../server/config/https/${env}/privatekey.key`)
    , cert: fs.readFileSync(`../server/config/https/${env}/cert_bundle.crt`)
    , ca: [fs.readFileSync(`../server/config/https/${env}/gd_bundle-g2-g1.crt`)] 
  // }, app).listen(9191); // NOTE: uncomment to test HTTPS locally
  }, app).listen(443);

  require('http').createServer((req, res) => {
    console.log("REDIRECTING TO HTTPS");
    res.writeHead(302, {
      'Location': `https://${config.get('app.url')}${req.url}`
      // 'Location': 'https://localhost:9191' + req.url // NOTE: uncomment to test HTTPS locally
    });
    res.end();
  // }).listen(3031); // NOTE: uncomment to test HTTPS locally
  }).listen(80);

} else {
  app.listen(config.get('app.port'), () => {
    console.log(`yote app listening at ${config.get('app.port')}`)
  })
}