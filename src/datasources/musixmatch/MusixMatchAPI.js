const music = require('musicmatch')({apikey:process.env.MUSICMATCH_API_KEY});
const R = require('rambda');

class MusixMatchAPI {
    getTrack = (isrc) => music.track({track_isrc: isrc});
    hasLyrics = (track) => {
        console.log(`track ${track.message.header.status_code}, ${track.message.body.track.has_lyrics}`);
        return track.message.header.status_code == '200' && track.message.body.track.has_lyrics;
    }
    getLyrics = (track) => {
        console.log(`getlyrivcs ${track.message.body.track.track_id}`);
        return music.trackLyrics({
            track_id: track.message.body.track.track_id
        })
    };
    getCleanLyrics = (lyrics) => {
        console.log(`lyrics ${JSON.stringify(lyrics.lyrics_body)}`);
        return Promise.resolve(JSON.stringify(lyrics.lyrics_body));
    };
    getNoLyricsFound = () => Promise.resolve("no lyrics found");
    
    getLyricsByIsrc = async (isrc) => {
        const track = await this.getTrack(isrc);
        //if (this.hasLyrics(track)) {
        if (track.message.header.status_code == '200' && track.message.body.track.has_lyrics) {
            const lyrics = await this.getLyrics(track);
            return this.getCleanLyrics(lyrics);

        }
        else {
            return this.getNoLyricsFound();
        }
    };
}

module.exports = MusixMatchAPI