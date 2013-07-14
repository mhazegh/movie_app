$(document).ready(function(){
  // On load reset fields.
  $("#genre_field").prop('selectedIndex',0);
  $("#actor_field").val("");
  $("#similar_field").val("");

  // Define function to format progress bar.
  var create_bar = function(score){
    if (score == -1){
      score = 0;
    } 
    return ('<div class="progress" style="height:2px;">'+
           '<div class="bar bar-danger" style="width: '+score+'%;height: 2px;"></div>'+
           '<div class="bar bar-warning" style="width: '+(100-score)+'%;height: 2px;"></div>'+
           '</div>');
  };
  $.getJSON("movie_data.json", function(data){
    // Generate a list of actors.
    var actors = []
    for(key in data){
      for(i in data[key].actors){
        if(actors.indexOf(data[key].actors[i]) == -1){
          actors.push(data[key].actors[i]);
        }
      }
    }
    // Setup typeahead for actors.
    $("#actor_field").typeahead({source:actors, items:4});
    // Generate a list of movies.
    var all_movies = []
    for (key in data){
        all_movies.push(key);
    } 
    // Setup typeahead for movies.
    $("#similar_field").typeahead({source:all_movies, items:4});
    // Handle genre_btn click.
    $("#genre_btn").click(function(){
      $("ul").empty();
      $("#sortby").text("");
      var genre = $("#genre_field").val();
      var movies = [];
      $.each(data, function(key, value) {
        if(value.genres.indexOf(genre) >=0){
          movies.push({title:key, critics_score:value.critics_score});
        }
      });
      movies.sort(function(x,y){return x.critics_score - y.critics_score}).reverse();
      for(i in movies){
        $("ul").append('<li><a href="'+data[movies[i].title].rt_link+'" target="_blank">'+movies[i].title+'</a><span class="right">'+movies[i].critics_score+'</span></li>');
        $("ul").append(create_bar(movies[i].critics_score));
      }
      $("#sortby").text(genre);
    });
    // Handle actor_btn click.
    $("#actor_btn").click(function(){
      $("ul").empty();
      $("#sortby").text("");
      var actor = $("#actor_field").val();
      var movies = [];
      $.each(data, function(key, value) {
        if(value.actors.indexOf(actor) > -1){
          movies.push({title:key, critics_score:value.critics_score});
        }
      });
      movies.sort(function(x,y){return x.critics_score - y.critics_score}).reverse();
      for(i in movies){
        $("ul").append('<li><a href="'+data[movies[i].title].rt_link+'" target="_blank">'+movies[i].title+'</a><span class="right">'+movies[i].critics_score+'</span></li>');
        $("ul").append(create_bar(movies[i].critics_score));
      }
      $("#sortby").text(actor);
      $("#actor_field").val("");
    });
    // Handle similer_btn click.
    $("#similar_btn").click(function(){
      $("ul").empty();
      $("#sortby").text("");
      var movie = $("#similar_field").val();
      var similar_movies = [];
      for(i in data[movie].similar){
        if(data[data[movie].similar[i]]){
          similar_movies.push({title:data[movie].similar[i],critics_score:data[data[movie].similar[i]].critics_score});
        }
      }
      // Sort the similar movies.
      similar_movies.sort(function(x,y){return x.critics_score - y.critics_score}).reverse();
      for(i in similar_movies){
        $("ul").append('<li><a href="'+data[similar_movies[i].title].rt_link+'" target="_blank">'+similar_movies[i].title+'</a><span class="right">'+similar_movies[i].critics_score+'</span></li>');
        $("ul").append(create_bar(similar_movies[i].critics_score));
      }
      $("#sortby").text(movie);
      $("#similar_field").val("");

    });
  });
});
