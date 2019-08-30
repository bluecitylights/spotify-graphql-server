const fetch = require ('node-fetch');
const R = require('ramda');

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

const haveToken = async () => {
    token = await spotifyProxy();
    return token;

};
module.exports.haveToken = haveToken;


