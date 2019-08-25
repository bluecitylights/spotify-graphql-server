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
      artists: (parent,args,ctx,info) => ctx.dataSources.spotifyAPI.searchArtist(args.byName),
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
        return ctx.dataSources.spotifyAPI.getPlaylistsOfUser();
      },
      topTracks: (parent,args,ctx,info) => {
        return ctx.dataSources.spotifyAPI.getUserTopTracks({timeRange: args.timeRange})
      },
      topArtists: (parent,args,ctx,info) => {
        return ctx.dataSources.spotifyAPI.getUserTopArtists({timeRange: args.timeRange})
      },
      recent: (parent,args,ctx,info) => {
        return ctx.dataSources.spotifyAPI.getRecentlyPlayed();
      }
    },
    Track: {
      lyrics: async (parent, args, ctx) => {
        return ctx.dataSources.musixMatchAPI.getLyricsByIsrc(parent.external_ids["isrc"]);
      }
    },
    Artist: {
      image: ({images}) => images[0] ? images[0].url : '',
      albums: async (parent, args, ctx) => ctx.dataSources.spotifyAPI.getAlbumsForArtist(parent.id)
    },
    Album: {
      image: ({images}) => images[0] ? images[0].url : '',
      tracks: async (parent, args, ctx) => ctx.dataSources.spotifyAPI.getAlbumTracks(parent.id)
    }
  };

module.exports.typeDefs = typeDefs;
module.exports.resolvers = resolvers;

