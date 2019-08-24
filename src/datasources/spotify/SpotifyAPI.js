const { RESTDataSource, RequestOptions  } = require('apollo-datasource-rest')
const R = require('rambda')

class SpotifyAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://api.spotify.com/v1/';
    }

    willSendRequest(request) {
        token = this.context.spotify_user_token ? this.context.spotify_user_token : this.context.spotify_app_token;
        request.headers.set('Authorization', `${token}`);
        request.headers.set('Content-Type', `application/json`);
        request.headers.set('Accept', `application/json`);
    }

    getMe = async () => {
        return this.get(`me`);
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
        const data = await this.get(`users/${userId}/playlists`);//, {limit, offset});
        return data.items || [];
    }

    getPlaylistTracks = async (playlistId) => {
        const data = await this.get(`playlists/${playlistId}/tracks`);
        // todo: let playlist return PlayliastTracks, so we can display added_at, added_by etc when navigating playlists.
        return R.pluck('track', data.items || []);
    }
}

module.exports = SpotifyAPI