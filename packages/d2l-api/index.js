var cors = require('cors');
var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var schema = require('./src/schema.js');
var root = require('./src/root-resolver.js');

var app = express();

app.use(cors());

// This is only needed so that we can see the value of body in our logging function
//app.use(express.json());
// We can use this if we also want to see data that was passed to us in the wrong format!
const bodyParser = require('body-parser');
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
  let send = res.send;
  res.send = data => {
    const { ip, method, url, path, query, params, body } = req;
    console.log(`${new Date().toISOString()} << [${ip}] ${res.statusCode} ${String(data).slice(0, 1024)}`);
    res.send = send;
    return res.send(data);
  };
  next();
};

app.use(
  '/graphql',
  logRequest,
  logResponse,
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  }),
);

app.listen(4000);

console.log('Running a GraphQL API server at http://localhost:4000/graphql');
