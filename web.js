var express = require('express'),
    mongoose = require('mongoose'),
    models = require('./models/models'),
    app = express.createServer(express.logger()),
    fs = require('fs'),
    passport = require('passport'),
    util = require('util'),
    GoogleStrategy = require('passport-google').Strategy;

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the GoogleStrategy within Passport.
passport.use(new GoogleStrategy({
    returnURL: 'http://localhost:5000/auth/google/return',
    realm: 'http://localhost:5000/'
  },
  function(identifier, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'keyboard cat' }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use('/', express.static(__dirname + '/'));
});

app.get('/', function(req, res) {
    res.render('index', { user: req.user });
});

app.get('/control_panel', ensureAuthenticated, function(req, res){
  res.render('control_panel', { user: req.user });
});

app.get('/auth/google', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/auth/google/return', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
// Connect to the database and collection
mongoose.connect('mongodb://localhost/movie_db/movies');

// Get all information about a certian movie.
app.get('/movies/title/:title', function(req, res){
    return models.movie_model.find({'title':req.params.title}, function(err, movie){
        if (!err){
            return res.send(movie);
        } else {
            return console.log(err);
        }
    });
});

// Get movies of a certian genre.
app.get('/movies/genre/:genre', function(req, res){
    return models.movie_model.find({'genres':req.params.genre}, function(err, movies){
        if (!err){
            return res.send(movies);
        } else {
            return console.log(err);
        }
    });
});

// Get movies which have a specific actor.
app.get('/movies/actor/:actor', function(req, res){
    return models.movie_model.find({'actors':req.params.actor}, function(err, movies){
        if (!err){
            return res.send(movies);
        } else {
            return console.log(err);
        }
    });
});

// Get movies similar to passed in movie.
app.get('/movies/similar/:movie', function(req, res){
    return models.movie_model.find({'similar':req.params.movie}, function(err, movies){
        if (!err){
            return res.send(movies);
        } else {
            return console.log(err);
        }
    });
});

// Get a list of distinct movie titles.
app.get('/movies', function(req, res){
    return models.movie_model.distinct('title', function(err, titles) {
        if(!err){
            return res.send(titles);
        } else {
            return console.log(err);
        }
    });
});

// Get a list of distinct genres.
app.get('/genres', function(req, res){
    return models.movie_model.distinct('genres', function(err, genres){
        if (!err){
            return res.send(genres.sort());
        } else {
            return console.log(err);
        }
    });
});

// Get a list of distinct actors.
app.get('/actors', function(req, res){
    return models.movie_model.distinct('actors', function(err, actors){
        if (!err){
            return res.send(actors);
        } else {
            return console.log(err);
        }
    });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
