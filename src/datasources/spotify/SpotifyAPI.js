const { RESTDataSource, RequestOptions  } = require('apollo-datasource-rest')
const R = require('rambda')

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

    search = async (type, searchQuery) => {
        return this.get(`search`, {
             q: searchQuery,
             type: type
        });
        return;
    }

    searchArtist = async (searchQuery) => {
        const data = await this.search('artist', searchQuery);
        return (data.artists.items || []);
    }


}

module.exports = SpotifyAPI