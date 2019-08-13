const fs = require('fs');
const path = require('path');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const { makeExecutableSchema } = require('graphql-tools');

const schemaFile = path.join(__dirname, 'schema.graphql');
const typeDefs = fs.readFileSync(schemaFile, 'utf8');

const { fetchArtistsByName, fetchPlaylistsOfUser, fetchPlaylistsOfPublicUser, fetchMe, fetchPublicUser, fetchMyTopTracks, fetchMyTopArtists } = require('./resolvers');

const resolvers = {
  Query: {
    me: (parent,args,ctx,info) => fetchMe(),
    user: (parent,args,ctx,info) => fetchPublicUser(args),
    artists: (parent,args,ctx,info) => fetchArtistsByName(args.byName),
    playlists: (parent,args,ctx,info) => fetchPlaylistsOfUser(args)
  },
  PublicUser: {
    playlists: (parent,args,ctx,info) => {
      return fetchPlaylistsOfPublicUser({userId: parent.id, limit: args.limit, offset: args.offset})
    }
  },
  User: {
    playlists: (parent,args,ctx,info) => {
      return fetchPlaylistsOfUser({limit: args.limit, offset: args.offset})
    },
    topTracks: (parent,args,ctx,info) => {
      return fetchMyTopTracks({timeRange: args.timeRange, limit: args.limit, offset: args.offset})
    },
    topArtists: (parent,args,ctx,info) => {
      return fetchMyTopArtists({timeRange: args.timeRange, limit: args.limit, offset: args.offset})
    }
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = schema;
