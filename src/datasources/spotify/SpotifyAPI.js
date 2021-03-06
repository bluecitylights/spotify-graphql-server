const { RESTDataSource, RequestOptions  } = require('apollo-datasource-rest')
const R = require('ramda')

class SpotifyAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://api.spotify.com/v1/';
    }

    getToken = (request, spotify) => 
        R.prop('path', request).startsWith('me') ? R.prop('user_token', spotify) : R.prop('app_token', spotify)
    

    willSendRequest(request) {
        token = this.getToken(request, this.context.spotify);
        request.headers.set('Authorization', `${token}`);
        request.headers.set('Content-Type', `application/json`);
        request.headers.set('Accept', `application/json`);
    }

    getMe = async () => {
        return this.get(`me`);
    }

    getPlayer = async () => {
        const data = await this.get(`me/player`);
        return data;
    }

    getStatistics = async () => Promise.resolve({})

    getPlaylistsOfUser = async () => {
        const data = await this.get(`me/playlists`);
        return (data.items || []);
    }

    getUserTop = async (timeRange, type) => {
        return this.get(`me/top/${type}`, {
            time_range: 'short_term' // todo
        });
    }

    getUserTopTracks = async (timeRange) => {
        const data = await this.getUserTop(timeRange, 'tracks');
        return data.items || [];
    }

    getUserTopArtists = async (timeRange) => {
        const data = await this.getUserTop(timeRange, 'artists');
        return data.items || [];
    }

    getRecentlyPlayed = async () => {
        console.log(`rcent`);
        const data = await this.get(`me/player/recently-played`);
        return R.pluck('track', data.items || []);
    }
        
    getCurrentSong = async () => {
        const data = await this.get(`me/player/currently-playing`);
        const item = R.prop('item', data)
        const progress_ms = R.prop('progress_ms', data)
        return { 
            ...item,
            progress_ms
        }
    }

    pause = async () => {
        const data = await this.getCurrentSong();
        await this.put(`me/player/pause`);
        return data;
    }

    play = async ({context_uri, track_uris}) => {
        let body = {}
        if (track_uris) {
            body = {uris: track_uris}
        }
        else if (context_uri) {
            body = {context_uri}
        }
        
        await this.put(`me/player/play`, body);
        await new Promise(done => setTimeout(done, 500)); 
        const data = this.getCurrentSong();
        return data;
    }

    next = async () => {
        await this.post(`me/player/next`);
        await new Promise(done => setTimeout(done, 500)); 
        const data = await this.getCurrentSong(); // todo: validate that we ccidentally have next song
        return data;
    }

    previous = async () => {
        await this.post(`me/player/previous`);
        await new Promise(done => setTimeout(done, 500)); 
        const data = await this.getCurrentSong();
        return data;
    }

    getUserById = async (id) => {
        return this.get(`users/${id}`);
    }
    
    getPlaylistById = async (playlistId) => {
        return this.get(`playlists/${playlistId}`);
    }

    getPlaylistsById = async (playlistIds) => {
        let playlists = await Promise.all(playlistIds.map(this.getPlaylistById));
        return playlists;
    }

    getPlaylistsByUserId = async (userId) => {
        const data = await this.get(`users/${userId}/playlists`);
        return data.items || [];
    }

    getPlaylistTracks = async (playlistId) => {
        const data = await this.get(`playlists/${playlistId}/tracks`);
        // todo: let playlist return PlayliastTracks, so we can display added_at, added_by etc when navigating playlists.
        return R.pluck('track', data.items || []);
    }

    getAlbumsForArtist = async (artistId) => {
        const data = await this.get(`artists/${artistId}/albums`);
        return (data.items || []);
    }

    getAlbumTracks = async (albumId) => {
        const data = await this.get(`albums/${albumId}/tracks`);
        return (data.items || []);
    }

    _search = async (type, searchQuery) => {
        return this.get(`search`, {
             q: searchQuery,
             type: type
        });
        return;
    }

    search = async(searchQuery) => {
        const data = await this._search(searchQuery.type, searchQuery.text);
        const result = R.pipe(
            R.props(['artists','albums','playlists','tracks']),
            R.filter(R.complement(R.isNil)),
            R.pluck('items'),
            R.flatten
        )(data);
        return result
    }

    searchArtist = async (searchQuery) => {
        const data = await this._search('artist', searchQuery);
        return (data.artists.items || []);
    }
}

module.exports = SpotifyAPI