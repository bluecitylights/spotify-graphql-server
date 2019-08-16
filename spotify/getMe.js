const fetch = require('node-fetch');
const credentials = require('./credentials');

const getMe = (accessToken) => {
    console.log(`fetch me`);

    // const response = await fetch(`https://api.spotify.com/v1/me`, {
    //     headers: await haveHeadersWithMyToken()
    // });
    // const data = await response.json();
    // throwExceptionOnError(data);

    // return data;

    const url = '`https://api.spotify.com/v1/me`';

    return fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    })
    .then(res => res.json())
    .then(data => data)
    .catch(error => console.log(error));

}
module.exports = getMe;