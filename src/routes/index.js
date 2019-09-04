var express = require('express');
var packageJson = require('../../package.json');
var router = express.Router();
let request = require('request')
let querystring = require('querystring')

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Spotify Graphql Server', version: packageJson.version });
});

let redirect_uri = 
  process.env.REDIRECT_URI || 
  'http://localhost:4000/callback'

  router.get('/login', function(req, res) {
  console.log('login');
    res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: 'user-read-private user-read-email',
      redirect_uri,
      state: req.query.client_redirect_uri
    }));
})

router.get('/callback', function(req, res) {
  console.log('callb')
  let code = req.query.code || null
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
      ).toString('base64'))
    },
    json: true
  }
  request.post(authOptions, function(error, response, body) {
    var access_token = body.access_token
    let uri = req.query.state/*process.env.FRONTEND_URI*/ || 'http://localhost:3000'
    res.redirect(uri + '?access_token=' + access_token)
  })
})

module.exports = router;
