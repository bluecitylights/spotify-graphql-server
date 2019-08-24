const { RESTDataSource, RequestOptions  } = require('apollo-datasource-rest')
const R = require('rambda')

class SpotifyAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://api.spotify.com/v1/';
    }

    willSendRequest(request) {
        request.headers.set('Authorization', `Bearer ${this.context.token}`);
        request.headers.set('Content-Type', `application/json`);
        request.headers.set('Accept', `application/json`);
      }

    getPlaylistById = async (playlistId) => {
        return this.get(`playlists/${playlistId}`);
    }

    getPlaylistsById = async (playlistIds) => {
        let playlists = await Promise.all(playlistIds.map(this.getPlaylistById));
        return playlists;
    }

}

module.exports = SpotifyAPI