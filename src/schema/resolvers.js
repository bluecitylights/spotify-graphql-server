import { combineResolvers } from 'graphql-resolvers';

const isUserAuthenticated = (parent,args,ctx,info) => {
  if (!ctx.spotify.user_token) {
    return new Error('not authenticated');
  }
}

const getImage = ({images}) => images[0] ? images[0].url : '';
const getMe = (parent, args, ctx) => ctx.dataSources.spotifyAPI.getMe();
const play = (parent, args, ctx) => ctx.dataSources.spotifyAPI.play();
const pause = (parent, args, ctx) => ctx.dataSources.spotifyAPI.pause();
const next = (parent, args, ctx) => ctx.dataSources.spotifyAPI.next();
const previous = (parent, args, ctx) => ctx.dataSources.spotifyAPI.previous();

const resolvers = {
    Query: {
      me: (parent, args, ctx) => combineResolvers(isUserAuthenticated, getMe),
      user: (parent,args,ctx,info) => ctx.dataSources.spotifyAPI.getUserById(args.id),
      artists: (parent,args,ctx,info) => ctx.dataSources.spotifyAPI.searchArtist(args.byName),
      playlists: async(parent,args,ctx,info) => ctx.dataSources.spotifyAPI.getPlaylistsById(args.ids)
    },

    Mutation: {
      play: combineResolvers(isUserAuthenticated, play),
      pause: combineResolvers(isUserAuthenticated, pause),
      next: combineResolvers(isUserAuthenticated, next),
      previous: combineResolvers(isUserAuthenticated, previous)
    },

    PublicUser: {
      playlists: async ({id},args,ctx) => ctx.dataSources.spotifyAPI.getPlaylistsByUserId(id)
    },
    Playlist: {
      image: ({images}) => getImage(images),
      tracks: async (parent, args, ctx) => ctx.dataSources.spotifyAPI.getPlaylistTracks(parent.id)
    },
    User: {
      playlists: (parent,args,ctx,info) => ctx.dataSources.spotifyAPI.getPlaylistsOfUser(),
      stats: (parent,args,ctx,info) => ctx.dataSources.spotifyAPI.getStatistics(),
      player: (parent,args,ctx,info) => ctx.dataSources.spotifyAPI.getPlayer()
    },
    Statistics: {
      topArtists: (parent,args,ctx,info) => {
        return ctx.dataSources.spotifyAPI.getUserTopArtists({timeRange: args.timeRange})
      },
      topTracks: (parent,args,ctx,info) => {
        return ctx.dataSources.spotifyAPI.getUserTopTracks({timeRange: args.timeRange})
      }
    },
    Player: {
      recent: (parent,args,ctx,info) => {
        return ctx.dataSources.spotifyAPI.getRecentlyPlayed();
      },
      current: (parent,args,ctx,info) => {
        return ctx.dataSources.spotifyAPI.getCurrentSong();
      }
    },
    Track: {
      lyrics: async (parent, args, ctx) => {
        return ctx.dataSources.musixMatchAPI.getLyricsByIsrc(parent.external_ids["isrc"]);
      }
    },
    Artist: {
      image: ({images}) => getImage(images),
      albums: async (parent, args, ctx) => ctx.dataSources.spotifyAPI.getAlbumsForArtist(parent.id)
    },
    Album: {
      image: ({images}) => getImage(images),
      tracks: async (parent, args, ctx) => ctx.dataSources.spotifyAPI.getAlbumTracks(parent.id)
    }
  };

module.exports.resolvers = resolvers;

