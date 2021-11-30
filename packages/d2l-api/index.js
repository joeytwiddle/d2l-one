var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var schema = require('./src/schema.js');
var root = require('./src/root-resolver.js');

var app = express();

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  }),
);

app.listen(4000);

console.log('Running a GraphQL API server at http://localhost:4000/graphql');
