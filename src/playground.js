const R = require('rambda')
console.log('playground');

const spotifyJsonToPlaylist = (playlist) => R.identity(playlist);
const getValidPlaylists = (playlists) => R.filter(validResponse, playlists);
const getExtendedPlaylists = (playlists) => R.map(spotifyJsonToPlaylist, playlists);

const validResponse = (response) => {
    return R.isNil(R.prop("error", response));
}

const playlists = [
    {"1": {
            "error": {}
        }
    },

    {"2": {
            "id": "2",
            "name": "p2"
        }
    },
    {"3": {
            "id": "3",
            "name": "p3"
        }
    }
];

const fetchPlaylist = (id) => playlists[id]

// const getP = (playlistIds) => Promise.all(
//     playlistIds.map(fetchPlaylist)
// );

// const fourtytwo = () => Promise.resolve(42);

// op = R.compose(
//     console.log, 
//     getExtendedPlaylists, 
//     getValidPlaylists,
//     R.then(p => p),
//     getP
// );


//getP(["1", "2", "3"]).then(op);

// const p = (playlists) => Promise.resolve([]);

// const fetchPlaylists = async (playlistids) => {
//     console.log(`fetch playlists collection, ${playlistids}`);

//     // let playlists = await Promise.all(
//     //     playlistids.map(fetchPlaylist)
//     // );
    
//     return R.compose(getExtendedPlaylists, getValidPlaylists, then(p))(playlistids);
// }

// console.log(fetchPlaylists(["1", "2", "3"]));


var makeQuery = (email) => ({ query: { email }});
var fetchMember = (query) => {
  return Promise.resolve(
    {"firstName": "richard", 
     "lastName": "veldman", 
     "id": "1"
    }
  )
};

const then = R.curry((f, p) => p.then(f))
//getMemberName :: String -> Promise ({firstName, lastName})
var getMemberName = R.pipe(
  makeQuery,
  fetchMember,
  then(R.pick(['firstName', 'lastName']))
);

getMemberName().then(console.log);

