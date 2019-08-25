var express = require('express');
var packageJson = require('../../package.json');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Spotify Graphql Server', version: packageJson.version });
});


const authorizeSpotify = require('../datasources/spotify/auth/authorize');
const getAccessToken = require('../datasources/spotify/auth/getAccessToken');

router.get('/login', authorizeSpotify);
router.get('/callback', getAccessToken, (req, res, next) => {
  //res.redirect(`${clientUrl}/?authorized=true`);
  res.redirect(`/graphql?access_token=${req.credentials.access_token}`); // todo use session
  console.log(`successfull authenticated`);
});

module.exports = router;
