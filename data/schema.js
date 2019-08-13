const fs = require('fs');
const path = require('path');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const { makeExecutableSchema } = require('graphql-tools');

const schemaFile = path.join(__dirname, 'schema.graphql');
const typeDefs = fs.readFileSync(schemaFile, 'utf8');

const { fetchArtistsByName, fetchPlaylistsOfUser, fetchPlaylistsOfPublicUser, fetchMe, fetchPublicUser, fetchMyTopTracks, fetchMyTopArtists } = require('./resolvers');

const music = require('musicmatch')({apikey:process.env.MUSICMATCH_API_KEY});

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
  },
  Track: {
    lyrics: (parent,args,ctc,info) => {
      return music.track({track_isrc: parent.external_ids["isrc"]})
          .then(data => {
            //console.log(JSON.stringify(`data: ${JSON.stringify(data)}`));
            if (data.message.body.track.has_lyrics) {
              return music.trackLyrics({track_id: data.message.body.track.track_id})
                .then(data => {
                  _lyrics = JSON.stringify(data.message.body.lyrics.lyrics_body);
                  //console.log(`lyrics: ${_lyrics}`);
                  return Promise.resolve(_lyrics)
                })
            }
            else {
              return Promise.resolve("no lyrics found");
            }
          })
          .catch(err => err);
        }

    }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = schema;
