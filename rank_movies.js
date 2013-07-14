$(document).ready(function(){
  //On load reset fields.
  $("#genre_field").prop('selectedIndex',0);
  $("#actor_field").val("");
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
    // Handle genre_btn click.
    $("#genre_btn").click(function(){
      var genre = $("#genre_field").val();
      $("ul").empty();
      var movies = [];
      $.each(data, function(key, value) {
        if(value.genres.indexOf(genre) >=0){
          movies.push({title:key, critics_score:value.critics_score});
        }
      });
      movies.sort(function(x,y){return x.critics_score - y.critics_score}).reverse();
      for(i in movies){
        $("ul").append('<li><a href="'+data[movies[i].title].rt_link+'" target="_blank">'+data[movies[i].title].title+'</a><span class="right">'+movies[i].critics_score+'</span></li>');
      }
      $("#sortby").text(genre);
    });
    // Handle actor_btn click.
    $("#actor_btn").click(function(){
      var actor = $("#actor_field").val();
      $("ul").empty();
      var movies = [];
      $.each(data, function(key, value) {
        if(value.actors.indexOf(actor) > -1){
          movies.push({title:key, critics_score:value.critics_score});
        }
      });
      movies.sort(function(x,y){return x.critics_score - y.critics_score}).reverse();
      for(i in movies){
        $("ul").append('<li><a href="'+data[movies[i].title].rt_link+'" target="_blank">'+data[movies[i].title].title+'</a><span class="right">'+movies[i].critics_score+'</span></li>');
      }
      $("#sortby").text(actor);
      $("#actor_field").val("");
    });
  });
});
