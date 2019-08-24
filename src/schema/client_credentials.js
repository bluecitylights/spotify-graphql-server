/**
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#client_credentials_flow
 *
 * #authenticate() creates Promise for fetching a new authentication token with a `expire in ... ` information
 * which will be stored and used in the `isExpired()` check.
 *
 * Note: if `authenticate()` was not resolved yet, so there was no expire-information yet, the isExpired() will always
 * return `false`
 */

const fetch = require('node-fetch');

// load secrets from .env file and store in process.env
require('dotenv').config();

const credentials = require('../datasources/spotify/credentials');


const authorizationHeader = () => 'Basic ' + (Buffer.from(credentials.client_id + ':' + credentials.client_secret).toString('base64'));

const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
};

//
let expireTime = 0;

module.exports = {
    isExpired: () => {
        if(expireTime) {
            return Date.now() > expireTime;
        }
        return false;
    },
    authenticate: () => {
        const options = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization': authorizationHeader()
            },
            method: 'POST',
            body: 'grant_type=client_credentials'
        };

        return fetch(authOptions.url, options)
            .then((response) => {
                return response.json();
            })
            .then(token => {
                const time = Date.now();
                const expires_in = Number.parseInt(token.expires_in, 10);

                expireTime = time + expires_in * 1000; //

                return token;
            });
    }
};
