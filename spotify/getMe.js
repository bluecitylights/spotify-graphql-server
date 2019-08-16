const fetch = require('node-fetch');

const getMe = (token) => {
    console.log(`getMe ${token}`)
    const url = `https://api.spotify.com/v1/me`;

    return fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    })
    .then(res => res.json())
    .then(data => data)
    .catch(error => console.log(error));

}
module.exports = getMe;