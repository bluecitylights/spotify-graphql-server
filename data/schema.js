const fs = require('fs');
const path = require('path');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const { makeExecutableSchema } = require('graphql-tools');

const schemaFile = path.join(__dirname, 'schema.graphql');
const typeDefs = fs.readFileSync(schemaFile, 'utf8');

const { fetchArtistsByName, fetchPlaylistsOfUser, fetchMe, fetchUser } = require('./resolvers');

const resolvers = {
  Query: {
    me: (parent,args,ctx,info) => fetchMe(),
    user: (parent,args,ctx,info) => fetchUser(args),
    artists: (parent,args,ctx,info) => fetchArtistsByName(args.byName),
    playlists: (parent,args,ctx,info) => fetchPlaylistsOfUser(args)
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = schema;
