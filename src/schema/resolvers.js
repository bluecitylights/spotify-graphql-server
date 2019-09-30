import { combineResolvers, pipeResolvers } from 'graphql-resolvers';
import * as R from 'ramda'

const isUserAuthenticated = (parent,args,ctx,info) => {
  if (!ctx.spotify.user_token) {
    console.log('Error, not authenticaed')
    return new Error('NOT authenticated');
  }
}

const getSearchArgs = (args, info) => {
  const type = R.pipe(
    R.prop('fieldNodes'), 
    R.head, 
    R.path(['selectionSet', 'selections']), 
    // when querying __typename, selections contains more than fields specified in ...Artists{id name}. 
    // solved by filtering on inlinefragment. todo see if we need the filter to be even more strict
    R.filter(R.propEq('kind', 'InlineFragment')), 
    R.map(R.path(['typeCondition', 'name', 'value'])), 
    R.map(R.toLower)
  )(info);
  
  return {
      text: args.text,
      type: type.toString()
    };
}

const resolveSearchResult = (obj) => {
  return R.cond([
    [R.propEq('type', 'artist'), R.always('Artist')], 
    [R.propEq('type', 'album'), R.always('Album')],
    [R.propEq('type', 'playlist'), R.always('Playlist')],
    [R.propEq('type', 'track'), R.always('Track')]
  ])(obj);
}  

const getMe = (parent, args, ctx) => ctx.dataSources.spotifyAPI.getMe();
const play = (parent, args, ctx) => ctx.dataSources.spotifyAPI.play(args.playContext);
const pause = (parent, args, ctx) => ctx.dataSources.spotifyAPI.pause();
const next = (parent, args, ctx) => ctx.dataSources.spotifyAPI.next();
const previous = (parent, args, ctx) => ctx.dataSources.spotifyAPI.previous();

const getImage = (images) => {
  return images && images[0] ? images[0].url : ""
}
const resolvers = {
    Query: {
      me: combineResolvers(isUserAuthenticated, getMe),
      user: (parent,args,ctx,info) => ctx.dataSources.spotifyAPI.getUserById(args.id),
      artists: (parent,args,ctx,info) => ctx.dataSources.spotifyAPI.searchArtist(args.byName),
      playlists: async(parent,args,ctx,info) => ctx.dataSources.spotifyAPI.getPlaylistsById(args.ids),
      search: async(parent,args,ctx,info) => ctx.dataSources.spotifyAPI.search(getSearchArgs(args, info))
    },

    Mutation: {
      play: combineResolvers(isUserAuthenticated, play),
      pause: combineResolvers(isUserAuthenticated, pause),
      next: combineResolvers(isUserAuthenticated, next),
      previous: combineResolvers(isUserAuthenticated, previous)
    },

    SearchResult: {
      __resolveType(obj, context, info) {
        return resolveSearchResult(obj)
      }  
    },

    PublicUser: {
      playlists: async ({id},args,ctx) => ctx.dataSources.spotifyAPI.getPlaylistsByUserId(id),
      followers: (parent,args, ctx, info) => parent.followers.total,
    },
    Playlist: {
      followers: (parent,args, ctx, info) => parent.followers.total,
      image: ({images}) => getImage(images),
      tracks: async (parent, args, ctx) => ctx.dataSources.spotifyAPI.getPlaylistTracks(parent.id)
    },
    User: {
      image: ({images}) => getImage(images),
      playlists: (parent,args,ctx,info) => ctx.dataSources.spotifyAPI.getPlaylistsOfUser(),
      stats: (parent,args,ctx,info) => ctx.dataSources.spotifyAPI.getStatistics(),
      player: (parent,args,ctx,info) => ctx.dataSources.spotifyAPI.getPlayer(),
      followers: (parent,args, ctx, info) => parent.followers ? parent.followers.total : null
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
      progress: (parent) => parent.progress_ms,
      duration: (parent) => parent.duration_ms,
      lyrics: async (parent, args, ctx) => {
        return ctx.dataSources.dvoxLyrics.getLyricsByArtistsAndTitle(parent.artists[0].name, parent.name)
          .catch(e => ctx.dataSources.musixMatchAPI.getLyricsByIsrc(parent.external_ids["isrc"]))
      },
      image: (parent,args,ctx,info) => {
        return getImage(parent.album.images);
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

