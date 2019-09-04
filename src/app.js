const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const SpotifyAPI = require('./datasources/spotify/SpotifyAPI');
const MusixMatchAPI = require('./datasources/musixmatch/MusixMatchAPI');
const routes = require('./routes/index');
const {resolvers} = require('./schema/resolvers');
const {typeDefs} = require('./schema/typeDefs');
const {haveToken} = require('./datasources/spotify/auth/resolvers');
const {ApolloServer} = require('apollo-server-express');

const app = express();

const getDataSources = () => {
  return {
    spotifyAPI: new SpotifyAPI(),
    musixMatchAPI: new MusixMatchAPI()
  };
};

haveToken().then(console.log);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: getDataSources,
  context: ({req}) => haveToken().then(token => {
    return {
      spotify: {
        app_token: `Bearer ${token}`,
        user_token: req.headers.authorization || ''
      }
    };
  })
});
//console.log(`${JSON.stringify(schema)}`);
server.applyMiddleware({app, path: '/graphql'});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
//app.use(cors);
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
