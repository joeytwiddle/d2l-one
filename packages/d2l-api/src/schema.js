const fs = require('fs');
const { buildSchema } = require('graphql');

// Construct a schema, using GraphQL schema language
const schema = buildSchema(fs.readFileSync('./schema.gql', 'utf8'));

module.exports = schema;
