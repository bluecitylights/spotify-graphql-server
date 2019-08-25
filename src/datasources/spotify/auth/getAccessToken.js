const fetch = require('node-fetch');
const credentials = require('./credentials');

const getAccessToken = (req, res, next) => {
    const { code } = req.query;

    if (code) {
    const url = 'https://accounts.spotify.com/api/token';

    const data = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: credentials.redirect_uri,
        client_id: credentials.client_id,
        client_secret: credentials.client_secret,
    };

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    };

    const searchParams = new URLSearchParams();

    Object.keys(data).forEach(prop => {
        searchParams.set(prop, data[prop]);
    });

    fetch(url, {
        method: 'POST',
        headers,
        body: searchParams,
    })
    .then(res => res.json())
    .then(credentials => {
        req.credentials = credentials;
        next();
    })
    .catch(next);
    }
};

module.exports = getAccessToken;