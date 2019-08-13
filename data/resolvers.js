const fetch = require ('node-fetch');

function errorMsg (error) {
    if (error) {
        const { status = '', message = 'no details' } = error;
        return `Error: ${status}: ${message}`;
    }
    return 'An unknown error!'
}

function throwExceptionOnError (data) {
    if (data.error) {
        throw new Error(errorMsg(data.error));
    }
}

const headers = {
    'Accept': 'application/json',
    'Authorization': ''
};

const client_credentials = require('./client_credentials');

let awaitingAuthorization;

// const spotifyProxy = async ()  => {
const spotifyProxy = () => {
    if (awaitingAuthorization && !client_credentials.isExpired()) {
        // use existing promise, if not expired
        return awaitingAuthorization;
    }
    if (!awaitingAuthorization || client_credentials.isExpired()) {
        awaitingAuthorization = new Promise((resolve, reject) => {
            client_credentials.authenticate()
                .then((token) => {
                    headers.Authorization = 'Bearer ' + token.access_token;
                    resolve(headers);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
    return awaitingAuthorization;
};

const haveHeadersWithAuthToken = async () => {
    return await spotifyProxy()
};

const haveHeadersWithMyToken = async () => 
{
    return {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + process.env.SPOTIFY_USER_TOKEN
    };
}

const fetchMe = async () => {
    console.log(`fetch me`);

    const response = await fetch(`https://api.spotify.com/v1/me`, {
        headers: await haveHeadersWithMyToken()
    });
    const data = await response.json();
    throwExceptionOnError(data);

    return spotifyJsonToUser(data);
}

module.exports.fetchMe = fetchMe;

const fetchUser = async(args) => {
    console.log(`fetch user ${args.id}`);

    const response = await fetch(`https://api.spotify.com/v1/users/${args.id}`, {
        headers: await haveHeadersWithAuthToken()
    });
    const data = await response.json();
    throwExceptionOnError(data);

    return spotifyJsonToUser(data);
}

module.exports.fetchUser = fetchUser;

const spotifyJsonToUser = (userRaw) => {
    return {
        ...userRaw,
        playlists: fetchPlaylistsOfUser({userId:userRaw.id, limit:5, offset:0})
    }
}


module.exports.fetchArtistsByName = async (name) => {
    console.log(`debug: query artist ${name} `);

    const response = await fetch(`https://api.spotify.com/v1/search?q=${name}&type=artist`, {
        headers: await haveHeadersWithAuthToken()
    });
    const data = await response.json();
    throwExceptionOnError(data);

    return (data.artists.items || [])
        .map(artistRaw => spotifyJsonToArtist(artistRaw));
};

const fetchAlbumsOfArtist = async (artistId, limit) => {
    console.log(`debug: query albums of artist ${artistId} `);

    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
        headers: await haveHeadersWithAuthToken()
    });
    const data = await response.json();
    throwExceptionOnError(data);

    return (data.items || [])
        .map(albumRaw => spotifyJsonToAlbum(albumRaw));
};

module.exports.fetchAlbumsOfArtist = fetchAlbumsOfArtist;

const fetchPlaylistsOfUser = async (args) => {
    limit = args.limit;
    offset = args.offset;
    userId = args.userId;
    console.log(`fetch playlists, limt:${limit}, offset:${offset}`);

    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists?limit=${limit}&offset=${offset}`, {
        headers: await haveHeadersWithAuthToken()
    });
    const data = await response.json();
    throwExceptionOnError(data);

    return (data.items || [])
        .map(playlistRaw => spotifyJsonToPlaylist(playlistRaw));
    
}

module.exports.fetchPlaylistsOfUser = fetchPlaylistsOfUser;

const fetchSongsFromPlaylist = async (args) => {
    limit = args.limit;
    offset = args.offset;
    playlistId = args.id;
    console.log(`fetch songs, playlustId: ${playlistId}, limt:${limit}, offset:${offset}`);

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`, {
        headers: await haveHeadersWithAuthToken()
    });
    const data = await response.json();
    throwExceptionOnError(data);

    return (data.items || [])
        .map(trackRaw => spotifyJsonToTrack(trackRaw));
    
}

module.exports.fetchSongsFromPlaylist = fetchSongsFromPlaylist;

const spotifyJsonToArtist = async (raw) => {
    return {
        // fills with raw data (by ES6 spread operator):
        ...raw,

        // This needs extra logic: defaults to an empty string, if there is no image
        // else: just takes URL of the first image
        image: raw.images[0] ? raw.images[0].url : '',

        // .. needs to fetch the artist's albums:
        albums: (args, object) => {
            // this is similar to fetchArtistsByName()
            // returns a Promise which gets resolved asynchronously !
            const artistId = raw.id;
            const { limit=1 } = args;
            return fetchAlbumsOfArtist(artistId, limit);
        }
    };
};

const spotifyJsonToAlbum = (albumRaw) => {
    return {
        // fills with raw data (by ES6 spread operator):
        ...albumRaw,

        // This needs extra logic: defaults to an empty string, if there is no image
        // else: just takes URL of the first image
        image: albumRaw.images[0] ? albumRaw.images[0].url : '',

        tracks: [] // TODO implement fetching of tracks of album
    };
};

const spotifyJsonToPlaylist = (playlistRaw) => {
    return {
        ...playlistRaw,
        image: playlistRaw.images[0] ? playlistRaw.images[0].url : '',
        tracks: (args, object) => {
            return fetchSongsFromPlaylist({id:playlistRaw.id, limit:5, offset:0});
        }
    };
}

const spotifyJsonToTrack = (trackRaw) => {
    return {
        ...trackRaw.track
    }
}
