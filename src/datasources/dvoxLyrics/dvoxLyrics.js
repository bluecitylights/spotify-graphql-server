const { RESTDataSource, RequestOptions  } = require('apollo-datasource-rest')
const R = require('ramda');

class dvoxLyricsAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://dvox.ddns.net/lyrics-api/';
    }
    

    getNoLyricsFound = () => Promise.resolve("no lyrics found");
    
    getLyricsByArtistsAndTitle = async (artist, title) => {
        const trackResponse = await this.get(`lyrics`, {artist, title});
        if (trackResponse.result) {
            return Promise.resolve(JSON.stringify(trackResponse.result.lyrics));
        }
        else {
            throw new Error('no lyrics found')
        }
    }
}

module.exports = dvoxLyricsAPI;