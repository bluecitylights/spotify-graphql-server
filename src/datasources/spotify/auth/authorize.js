const credentials = require('./credentials');

const authorizeSpotify = (req, res) => {
    const scopes = 'user-read-email, user-read-private, user-read-recently-played, user-top-read';

    const url = `https://accounts.spotify.com/authorize?&client_id=${
    credentials.client_id
    }&redirect_uri=${encodeURI(
    credentials.redirect_uri
    )}&response_type=code&scope=${scopes}`;

    res.redirect(url);
};

module.exports = authorizeSpotify;