const fetch = require ('node-fetch');
const R = require('rambda');

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

const spotifyProxy = () => {
    if (awaitingAuthorization && !client_credentials.isExpired()) {
        // use existing promise, if not expired
        return awaitingAuthorization;
    }
    if (!awaitingAuthorization || client_credentials.isExpired()) {
        awaitingAuthorization = new Promise((resolve, reject) => {
            client_credentials.authenticate()
                .then((token) => {
                    resolve(token.access_token);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
    return awaitingAuthorization;
}

const haveHeadersWithAuthToken = () => {
    return haveToken().then(token => haveHeadersWithMyToken(token));

};

const haveHeadersWithMyToken = async (token) => 
{
    return {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
    };
}

const haveToken = async () => {
    token = await spotifyProxy();
    return token;

};

module.exports.haveToken = haveToken;

const fetchMe = async (access_token) => {
    console.log(`fetch me`);
    console.log(`${access_token}`);
    const response = await fetch(`https://api.spotify.com/v1/me`, {
        headers: await haveHeadersWithMyToken(access_token)
    });
    const data = await response.json();
    throwExceptionOnError(data);

    return data;//spotifyJsonToUser(data);
}

module.exports.fetchMe = fetchMe;

const fetchMyTopTracks = async (args) => {
    limit = args.limit;
    offset = args.offset;
    time_range = args.timeRange;
    console.log(`fetch my top tracks, limt:${limit}, offset:${offset}, time_range:${time_range}`);
    let request = `https://api.spotify.com/v1/me/top/tracks?time_range=${time_range}&limit=${limit}&offset=${offset}`;
    console.log(request);
    const response = await fetch(request, {
        headers: await haveHeadersWithMyToken(args.access_token)
    });
    const data = await response.json();
    throwExceptionOnError(data);

    console.log(`toptracks found ${data.items.length}`)
    return (data.items || [])
        .map(trackRaw => spotifyJsonToTrack(trackRaw));
    
}

module.exports.fetchMyTopTracks = fetchMyTopTracks;

const fetchMyTopArtists = async (args) => {
    limit = args.limit;
    offset = args.offset;
    time_range = args.timeRange;
    console.log(`fetch my top artisits, limt:${limit}, offset:${offset}, time_range:${time_range}`);
    let request = `https://api.spotify.com/v1/me/top/artists?time_range=${time_range}&limit=${limit}&offset=${offset}`;
    console.log(request);
    const response = await fetch(request, {
        headers: await haveHeadersWithMyToken(args.access_token)
    });
    const data = await response.json();
    throwExceptionOnError(data);

    console.log(`top artists found ${data.items.length}`)
    return (data.items || [])
        .map(trackRaw => spotifyJsonToArtist(trackRaw));
    
}

module.exports.fetchMyTopArtists = fetchMyTopArtists;

const fetchPublicUser = async(args) => {
    console.log(`fetch user ${args.id}`);

    const response = await fetch(`https://api.spotify.com/v1/users/${args.id}`, {
        headers: await haveHeadersWithAuthToken(args.access_token)
    });
    const data = await response.json();
    throwExceptionOnError(data);

    //return spotifyJsonToPublicUser(data);
    return data;
}

module.exports.fetchPublicUser = fetchPublicUser;

const spotifyJsonToUser = (userRaw) => {
    return {
        ...userRaw
        // ...userRaw,
        // playlists: fetchPlaylistsOfUser({userId:userRaw.id, limit:5, offset:0})
    }
}

const spotifyJsonToPublicUser = (userRaw) => {
    return {
        ...userRaw
        // ...userRaw,
        // playlists: fetchPlaylistsOfUser({userId:userRaw.id, limit:5, offset:0})
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

const fetchPlaylistsOfPublicUser = async ({userId, limit, offset}) => {
    console.log(`fetch playlists for user ${userId}, limt:${limit}, offset:${offset}`);

    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists?limit=${limit}&offset=${offset}`, {
        headers: await haveHeadersWithAuthToken()
    });
    const data = await response.json();
    throwExceptionOnError(data);

    return (data.items || [])
        .map(playlistRaw => spotifyJsonToPlaylist(playlistRaw));
    
}

module.exports.fetchPlaylistsOfPublicUser = fetchPlaylistsOfPublicUser;

const fetchPlaylist = async (playlist_id) => {
    console.log(`mape ${playlist_id}`);
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}`, {
        headers: await haveHeadersWithAuthToken()
    });
    const data = await response.json();
    return data;
};

const getValidPlaylists = (playlists) => R.filter(validResponse, playlists);
const getExtendedPlaylists = (playlists) => R.map(spotifyJsonToPlaylist, playlists);
const validResponse = (response) => R.isNil(R.prop("error", response));

const getAllPlaylist = (playlistIds) => Promise.all(
    playlistIds.map(fetchPlaylist)
);

const fetchPlaylists = async (playlistids) => {
    console.log(`fetch playlists collection, ${playlistids}`);

    let playlists = await getAllPlaylist(playlistids);
    
    return R.compose(getExtendedPlaylists, getValidPlaylists)(playlists);
}

module.exports.fetchPlaylists = fetchPlaylists;

const fetchPlaylistsOfUser = async (args) => {
    limit = args.limit;
    offset = args.offset;
    console.log(`fetch my playlists, limt:${limit}, offset:${offset}`);

    const response = await fetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`, {
        headers: await haveHeadersWithMyToken()
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
        .map(trackRaw => spotifyJsonToTrack(trackRaw.track));
    
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
        ...trackRaw
    }
}
