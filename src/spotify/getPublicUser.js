const {makeLoaders} = require('./SpotifyWebApi');

const getPublicUser = async (token, id) => {
    console.log('getPublicUser start');
    const {UserLoader} = makeLoaders(token);
    return  await UserLoader.load(id);
}

module.exports = getPublicUser