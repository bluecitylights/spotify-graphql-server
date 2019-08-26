const { RESTDataSource, RequestOptions  } = require('apollo-datasource-rest')
const R = require('rambda');

class MusixMatchAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://api.musixmatch.com/ws/1.1/';
    }
    
    willSendRequest(request) {
        request.params.set('apikey', process.env.MUSICMATCH_API_KEY);
    }

    getLyricsByMusixMatchTrackId = async (id) => {
        return this.get(`track.lyrics.get`, {track_id: id});
    }

    getNoLyricsFound = () => Promise.resolve("no lyrics found");

    getLyricsByIsrc = async (isrc) => {
        const trackResponse = await this.get(`track.get`, {track_isrc: isrc});
        const track = JSON.parse(trackResponse);
        if (this.hasLyrics(track)) {
            const lyrcsResponse = await this.getLyricsByMusixMatchTrackId(track.message.body.track.track_id);
            const lyrics = JSON.parse(lyrcsResponse);
            if (lyrics.message.header.status_code == `200`) {
                return Promise.resolve(JSON.stringify(lyrics.message.body.lyrics.lyrics_body));
            }
            else {
                return this.getNoLyricsFound();
            }

        }
        else {
            return this.getNoLyricsFound();
        }
    }

    hasLyrics = (track) => !R.isNil(track) && track.message.header.status_code == '200' && track.message.body.track.has_lyrics;
}

module.exports = MusixMatchAPI;