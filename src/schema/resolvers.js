import { combineResolvers } from 'graphql-resolvers';
import * as R from 'ramda'

const isUserAuthenticated = (parent,args,ctx,info) => {
  if (!ctx.spotify.user_token) {
    return new Error('not authenticated');
  }
}

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
      playlists: async(parent,args,ctx,info) => ctx.dataSources.spotifyAPI.getPlaylistsById(args.ids),
      search: async(parent,args,ctx,info) => ctx.dataSources.spotifyAPI.search(args.text)
    },

    Mutation: {
      play: combineResolvers(isUserAuthenticated, play),
      pause: combineResolvers(isUserAuthenticated, pause),
      next: combineResolvers(isUserAuthenticated, next),
      previous: combineResolvers(isUserAuthenticated, previous)
    },

    SearchResult: {
      __resolveType(obj, context, info) {
        if (obj.type == 'album'){
          return 'Album';
        }

        if (obj.type == 'artist'){
          return 'Artist';
        }

        if (obj.type == 'playlist'){
          return 'Playlist';
        }

        if (obj.type == 'track'){
          return 'Track';
        }
      }  
        //        return R.cond([
//           [R.propEq('type', 'album'), R.always('Album')]
//           [R.propEq('type', 'artist'), R.always('Artists')]
//           [R.propEq('type', 'playlist'), R.always('Playlist')]
//           [R.propEq('type', 'track'), R.always('Track')]
//         ])(obj)
//       }
//      }
    },

    PublicUser: {
      playlists: async ({id},args,ctx) => ctx.dataSources.spotifyAPI.getPlaylistsByUserId(id)
    },
    Playlist: {
      image: ({images}) => images[0] ? images[0].url : '',
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
      image: ({images}) => images[0] ? images[0].url : '',
      albums: async (parent, args, ctx) => ctx.dataSources.spotifyAPI.getAlbumsForArtist(parent.id)
    },
    Album: {
      image: ({images}) => images[0] ? images[0].url : '',
      tracks: async (parent, args, ctx) => ctx.dataSources.spotifyAPI.getAlbumTracks(parent.id)
    }
  };

module.exports.resolvers = resolvers;

