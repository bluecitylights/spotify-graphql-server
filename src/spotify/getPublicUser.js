const fetch = require('node-fetch');

const getPublicUser = (token, id) => {
    console.log(`getPublicUSer ${token}`)
    url = `https://api.spotify.com/v1/users/${id}`;
    return fetch(url, {
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(res => res.json())
    .then(data => data)
    .catch(error => console.log(error));
}

module.exports = getPublicUser