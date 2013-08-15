var mongoose = require('mongoose');

// Define a movie schema
var Schema = mongoose.Schema;
var Movie = new Schema({
    title: String,
    id: Number,
    genres: [String],
    actors: [String],
    similar: [String],
    critics_score: Number,
    audience_score: Number,
    rt_link: String
});

var MovieModel = mongoose.model('Movie', Movie);
exports.movie_model = MovieModel;
