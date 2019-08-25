const fs = require('fs');
const path = require('path');

const schemaFile = path.join(__dirname, 'schema.graphql');
const typeDefs = fs.readFileSync(schemaFile, 'utf8');

module.exports.typeDefs = typeDefs;
