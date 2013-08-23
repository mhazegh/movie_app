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

// Connect to the database and collection
mongoose.connect('mongodb://localhost/movie_db/');

// Use the GoogleStrategy within Passport.
passport.use(new GoogleStrategy({
    returnURL: 'http://localhost:5000/auth/google/return',
    realm: 'http://localhost:5000/'
  },
  function(identifier, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      models.UserModel.findOne({'email':profile.emails[0].value},'-movies',function(err, user){
        if(user){
          return done(null,user)
        }
        else{
          var new_user = new models.UserModel({
            name:profile.displayName,
            email:profile.emails[0].value,
            google_id:identifier,
          });
          new_user.save(function(err) {
            if (err) return handleError(err);
            else return done(null,new_user);
          });
        }
      });
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
  res.redirect('/')
}

// Get all information about a certian movie.
app.get('/movies/title/:title', ensureAuthenticated, function(req, res){
    return models.UserModel.aggregate({$match:{email:req.user.email}},{$unwind:"$movies"},{$match:{"movies.title":req.params.title}},{$group:{_id:"movie_info",movie:{$addToSet:"$movies"}}}, function(err, data){
        if (!err){
            if(data.length > 0){
                return res.send(data[0]['movie']);
            }
            else{
                return res.send([]);
            }
        } else {
            return console.log(err);
        }
    });
});

// Get all information from a movie id.
app.get('/movies/id/:id', ensureAuthenticated, function(req, res){
    return models.UserModel.aggregate({$match:{email:req.user.email}},{$unwind:"$movies"},{$match:{"movies.id":parseInt(req.params.id)}},{$group:{_id:"movie_info",movie:{$addToSet:"$movies"}}}, function(err, data){
        if (!err){
            if(data.length > 0) {
                return res.send(data[0]['movie']);
            }
            else {
                return res.send([]);
            }
        } else {
            return console.log(err);
        }
    });
});

// Get movies of a certian genre.
app.get('/movies/genre/:genre', ensureAuthenticated, function(req, res){
    return models.UserModel.aggregate({$match:{email:req.user.email}}, {$unwind:"$movies"},{$match:{"movies.genres":req.params.genre}},{$group:{_id:"by_genre",movies:{$addToSet:"$movies"}}}, function(err, data){
        if (!err){
            if(data.length > 0){
                return res.send(data[0]['movies']);
            }
            else{
                return res.send([]);
            }
        } else {
            return console.log(err);
        }
    });
});

// Get movies which have a specific actor.
app.get('/movies/actor/:actor', ensureAuthenticated, function(req, res){
    return models.UserModel.aggregate({$match:{email:req.user.email}},{$unwind:"$movies"},{$match:{"movies.actors":req.params.actor}},{$group:{_id:"by_actor",movies:{$addToSet:"$movies"}}}, function(err, data){
        if (!err){
            if(data.length > 0){
                return res.send(data[0]['movies']);
            }
            else{
                return res.send([]);
            }
        } else {
            return console.log(err);
        }
    });
});

// Get movies similar to passed in movie.
app.get('/movies/similar/:movie', ensureAuthenticated, function(req, res){
    return models.UserModel.aggregate({$match:{email:req.user.email}},{$unwind:"$movies"},{$match:{"movies.similar":req.params.movie}},{$group:{_id:"by_similar",movies:{$addToSet:"$movies"}}}, function(err, data){
        if (!err){
            if(data.length > 0){
                return res.send(data[0]['movies']);
            }
            else{
                return res.send([]);
            }
        } else {
            return console.log(err);
        }
    });
});

// Get a list of distinct movie titles.
app.get('/movies', ensureAuthenticated, function(req, res){
    return models.UserModel.aggregate({$match:{email:req.user.email}}, {$project:{a:"$movies.title"}}, {$unwind:"$a"}, {$group:{_id:'distinct_movies', titles:{$addToSet:'$a'}}}, function(err, data) {
        if (!err){
            if(data.length > 0){
                return res.send(data[0]['titles']);
            }
            else{
                return res.send([]);
            }
        } else {
            return console.log(err);
        }
    });
});

// Get a list of distinct genres.
app.get('/genres', ensureAuthenticated, function(req, res){
    return models.UserModel.aggregate({$match:{email:req.user.email}}, {$project:{a:"$movies.genres"}}, {$unwind:"$a"}, {$unwind:"$a"}, {$group:{_id:'genres', genres:{$addToSet:'$a'}}}, function(err, data){
        if (!err){
            if(data.length > 0){
                return res.send(data[0]['genres']);
            }
            else{
                return res.send([]);
            }
        } else {
            return console.log(err);
        }
    });
});

// Get a list of distinct actors.
app.get('/actors', ensureAuthenticated, function(req, res){
    return models.UserModel.aggregate({$match:{email:req.user.email}}, {$project:{a:"$movies.actors"}}, {$unwind:"$a"}, {$unwind:"$a"}, {$group:{_id:'actors', actors:{$addToSet:'$a'}}}, function(err, data){
        if (!err){
            if(data.length > 0){
                return res.send(data[0]['actors']);
            }
            else{
                return res.send([]);
            }
        } else {
            return console.log(err);
        }
    });
});

// Save movie for user.
app.post('/movies/new', ensureAuthenticated, function(req, res){
     return models.UserModel.update({"email":req.user.email},{"$push":{movies:req.body}}, function(err, data){
        if (!err){
            return res.send("Success");
        } else {
            return console.log(err);
        }
    });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
