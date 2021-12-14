console.log();
console.log(`------------------------------------------------------------`);

const cors = require('cors');
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./src/schema.js');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const root = require('./src/resolvers.js');
const db = require('./src/db-gsheet/db.js');
const bodyParser = require('body-parser');
const config = require('./src/config.js');
const { formatError } = require('graphql');

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// This is only needed so that we can see the value of body in our logging function
//app.use(express.json());
// We can use this if we also want to see data that was passed to us in the wrong format!
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.raw());

const logRequest = async (req, res, next) => {
  // Not sure this code is safe, better wrap it in try-catch!
  try {
    const { ip, method, url, path, query, params, body } = req;
    const queryString = Object.keys(query).length > 0 ? '?' + JSON.stringify(query) : '';
    const paramsString = Object.keys(params).length > 0 ? JSON.stringify(params) : '';
    // We make a copy of body so that we can cleanup the query string
    const bodyData = JSON.parse(JSON.stringify(body) || 'null');
    if (bodyData?.query) bodyData.query = bodyData.query.replace(/[ \n\t]+/g, ' ');
    //const bodyString = bodyData ? `(${typeof body}) ` + JSON.stringify(bodyData) : '';
    const bodyString = bodyData ? JSON.stringify(bodyData) : '';
    console.log(`${new Date().toISOString()} >> [${ip}] ${method} ${path}${queryString} ${paramsString || bodyString}`);
  } catch (error) {
    console.error(error);
  }
  next();
};

const logResponse = (req, res, next) => {
  const send = res.send;
  res.send = data => {
    const { ip, method, url, path, query, params, body } = req;
    console.log(`${new Date().toISOString()} << [${ip}] ${res.statusCode} ${String(data).slice(0, 1024)}`);
    res.send = send;
    return res.send(data);
  };
  next();
};

// This middleware only allows operations from authenticated users
// With the exception of two operations related to login
//
// NOTE: For more fine-grained authorization, add wrappers to individual resolvers in resolvers.js
//
const authenticatedOrLoggingIn = (req, res, next) => {
  const { ip, method, url, path, query, params, body } = req;
  const operationName = body && body.operationName;
  if (req.session.user || operationName === 'GetUser' || operationName === 'LogIn') {
    next();
  } else {
    console.warn(
      `${new Date().toISOString()} XX [${ip}] Trying to access unauthorized route: ${path} ${JSON.stringify(req.body)}`,
    );
    //next(new Error('Forbidden'));
    res.status(403);
    res.end();
  }
};

app.use(
  session({
    secret: 'house overleaf feeder listlessness nugget flood',
    cookie: {
      maxAge: config.cookieMaxAge,
      sameSite: true,
      secure: 'auto',
    },
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    store: new FileStore({}),
  }),
);

app.use(logRequest);
app.use(logResponse);

app.use(
  '/graphql',
  authenticatedOrLoggingIn,
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
    customFormatErrorFn: error => {
      // I find this easier to read, and find the line where the error occurred
      console.error(error);
      return error.toString();
    },
  }),
);

// To add support for subscriptoins, see here:
// https://github.com/graphql/express-graphql#setup-with-subscription-support

app.listen(config.listenPort);

console.log(`Running a GraphQL API server at http://localhost:${config.listenPort}/graphql`);

// On startup, do a quick query of the DB, to check everything is fine
setTimeout(() => {
  (async () => {
    //require('../google-sheets-quickstart/index');
    //const rescues = (await db.getAllRescues()).allRescues;
    //console.log('rescues[0]:', rescues[0]);
    const siteGroups = await db.getSiteGroups();
    console.log('siteGroups:', siteGroups);
  })().catch(console.error);
}, 1000);
