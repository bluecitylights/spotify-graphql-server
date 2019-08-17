var express = require('express');
var packageJson = require('../package.json');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Spotify Graphql Server', version: packageJson.version });
});


const authorizeSpotify = require('../spotify/authorize');
const getAccessToken = require('../spotify/getAccessToken');
const getRecentlyPlayed = require('../spotify/getRecentlyPlayed')

router.get('/login', authorizeSpotify);
router.get('/callback', getAccessToken, (req, res, next) => {
  //res.redirect(`${clientUrl}/?authorized=true`);
  res.redirect(`/graphql?access_token=${req.credentials.access_token}`); // todo use session
  console.log(`successfull authenticated`);
});

router.get('/history', (req, res) => {
  db.find({}, (err, docs) => {
    checkval = docs.length == 0;
    console.log(`history, docsleng ${docs.length}, check ${checkval}`);
    
    if (err || docs.length == 0) {
      res.redirect('/login');
    }
    else {
    const accessToken = docs[0].access_token;
    getRecentlyPlayed(accessToken)
      .then(data => {
        const arr = data.map(e => ({
          played_at: e.played_at,
          track_name: e.track.name,
        }));

        res.json(arr);
      })
      .catch(err => console.log(err));
    }
  });
});

module.exports = router;
