var fs = require('fs');
var { buildSchema } = require('graphql');

// Construct a schema, using GraphQL schema language
var schema = buildSchema(fs.readFileSync('./schema.gql', 'utf8'));

module.exports = schema;
