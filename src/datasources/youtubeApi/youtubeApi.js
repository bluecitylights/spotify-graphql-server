const { RESTDataSource, RequestOptions  } = require('apollo-datasource-rest')
const R = require('ramda');

class youtubeAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://dvox.ddns.net/lyrics-api/';
    }
    

    getNoLyricsFound = () => Promise.resolve("no lyrics found");
    
    getYoutubeidByArtistAndTitle = async (artist, title) => {
        // const trackResponse = await this.get(`lyrics`, {artist, title});
        // if (trackResponse.result) {
        //     return Promise.resolve(JSON.stringify(trackResponse.result.lyrics));
        // }
        // else {
        //     throw new Error('no lyrics found')
        // }
        return Promise.resolve("l9fN-8NjrvI")
    }
}

module.exports = youtubeAPI;