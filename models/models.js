var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MovieSchema = new Schema({
     title: String,
     id: Number,
     genres: [String],
     actors: [String],
     similar: [String],
     critics_score: Number,
     audience_score: Number,
     rt_link: String

});

var UserSchema = new Schema({
    name: String,
    email: String,
    google_id: String,
    movies: [MovieSchema]
});

var UserModel = mongoose.model('User', UserSchema);
exports.UserModel = UserModel;
