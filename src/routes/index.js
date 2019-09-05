var express = require('express');
var packageJson = require('../../package.json');
var router = express.Router();
let request = require('request')
let querystring = require('querystring')
const STATE_KEY = 'spotify_auth_state';

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Spotify Graphql Server', version: packageJson.version });
});

let redirect_uri = 
  process.env.REDIRECT_URI || 
  'http://localhost:4000/callback'

  router.get('/login', function(req, res) {
    const state = JSON.stringify({
      random: Math.random().toString(16),
      redirect: req.query.client_redirect_uri
    })
    res.cookie(STATE_KEY, state);
    res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: process.env.SPOTIFY_SCOPES,
      redirect_uri,
      state: state
    }));
})

router.get('/callback', function(req, res) {
  const { code, state } = req.query;
  const storedState = req.cookies ? req.cookies[STATE_KEY] : null;
  // state state validation
  if (state === null || state !== storedState) {
    res.redirect('/#/error/state mismatch');
  } else {
    res.clearCookie(STATE_KEY);
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64'))
      },
      json: true
    }
    request.post(authOptions, function(error, response, body) {
      const redirect = JSON.parse(state).redirect;
      //res.redirect(`${redirect}user/${body.access_token}/${body.refresh_token}`);
      res.redirect(`${redirect}?access_token=${body.access_token}`)
    });
  }
});
  

module.exports = router;
