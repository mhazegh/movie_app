var express = require('express');
var mongoose = require('mongoose');
var models = require('./models/models');
var app = express.createServer(express.logger());
var fs = require('fs');

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use('/', express.static(__dirname + '/'));
});

app.get('/', function(req, res) {
    res.render('index', { user: req.user });
});

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
