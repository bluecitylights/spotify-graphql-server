const fs = require('fs');
const path = require('path');

const schemaFile = path.join(__dirname, 'schema.graphql');
const typeDefs = fs.readFileSync(schemaFile, 'utf8');

const { haveToken,fetchArtistsByName, fetchPlaylistsOfUser, fetchPlaylistsOfPublicUser, fetchMe, fetchPublicUser, fetchMyTopTracks, fetchMyTopArtists, fetchPlaylists } = require('./resolvers');
const getMe = require('../datasources/spotify/getMe');
const getPublicUser = require('../datasources/spotify/getPublicUser');

const resolvers = {
    Query: {
      me: (parent,args,ctx,info) => ctx.dataSources.spotifyAPI.getMe(),
      user: (parent,args,ctx,info) => ctx.dataSources.spotifyAPI.getUserById(args.id),
      artists: (parent,args,ctx,info) => fetchArtistsByName(args.byName),
      playlists: async(parent,args,ctx,info) => ctx.dataSources.spotifyAPI.getPlaylistsById(args.ids)
    },
    PublicUser: {
      playlists: async ({id},args,ctx) => {
        console.log(`id ${id}`);
        return ctx.dataSources.spotifyAPI.getPlaylistsByUserId(id);
      }
    },
    Playlist: {
      image: ({images}) => images[0] ? images[0].url : '',
      tracks: async (parent, args, ctx) => {
        return ctx.dataSources.spotifyAPI.getPlaylistTracks(parent.id);
      }
    },
    User: {
      playlists: (parent,args,ctx,info) => {
        return fetchPlaylistsOfUser({limit: args.limit, offset: args.offset})
      },
      topTracks: (parent,args,ctx,info) => {
        return fetchMyTopTracks({timeRange: args.timeRange, limit: args.limit, offset: args.offset, access_token: ctx.query.access_token})
      },
      topArtists: (parent,args,ctx,info) => {
        return fetchMyTopArtists({timeRange: args.timeRange, limit: args.limit, offset: args.offset, access_token: ctx.query.access_token})
      }
    },
    Track: {
      lyrics: async (parent, args, ctx) => {
        return ctx.dataSources.musixMatchAPI.getLyricsByIsrc(parent.external_ids["isrc"]);
      }
    }
  };

module.exports.typeDefs = typeDefs;
module.exports.resolvers = resolvers;
//export default makeExecutableSchema({ typeDefs, resolvers});
