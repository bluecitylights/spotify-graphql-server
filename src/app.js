const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const SpotifyAPI = require('./spotify');
const routes = require('./routes/index');
const {typeDefs, resolvers} = require('./schema');
const { ApolloServer } = require('apollo-server-express');
//import schema from './schema/index';

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => {
    return {
      spotifyAPI: new SpotifyAPI()
    };
  },
  context: () => {
    return {
      token: 'BQBEtPx11Q--k0tqv1fl6UP3DuVMA3QyalnR0LVbOrr2_m39ZdYBMLrnudevOUYBz8XKGcHex0N-ckgbnT1wO8dbOskmEXFZwqRh5CnOATpLneua7WOVGmZPCPlTVhDLuXwp6jHkoOKdIioMrOjAId6TjnOZQ0Hpprme7BVoWT3SxsF2OdX7jRpkd43d_w1uADyXLSpxN5ygzg',
    };
  },
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
