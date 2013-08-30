$(document).ready(function(){
    // Define function to reset fields.
    var reset = function(){
        $("#genre_field").prop('selectedIndex',0);
        $("#actor_field").val("");
        $("#similar_field").val("");
    };
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
    // Reset the fields on page-load.
    reset();
    // Populate the genres dropdown.
    $.get('/genres', function(genres){
        genres.sort();
        for(var i in genres) {
            $('select').append('<option>'+genres[i]+'</option>');
        }
    });
    // Populate the actor typeahead box.
    $.get('/actors', function(actors){
        $('#actor_field').typeahead({source:actors, items:4});
    });
    // Populate the similar typeahead box.
    $.get('/movies', function(movies){
        $('#similar_field').typeahead({source:movies, items:4});
    });
    // Handle genre_btn click.
    $('#genre_btn').click(function(){
        $("#data").empty();
        $("#sortby").text("");
        var genre = $("#genre_field").val();
        $.get('/movies/genre/'+genre, function(movies){
            movies.sort(function(x,y){return x.critics_score - y.critics_score;}).reverse();
            for(var i in movies){
                if(movies[i].critics_score == -1) {
                    movies[i].critics_score = 'n/a'
                }
                $('<tr><td><a href="'+movies[i].rt_link+'" target="_blank">'+movies[i].title+'</a><span class="right">'+movies[i].critics_score+'</span>'+create_bar(movies[i].critics_score) + "</td></tr>").appendTo("#data").children("tbody");
            }
            $("#sortby").text(genre);            
        });
    });
    // Handle actor_btn_click.
    $('#actor_btn').click(function(){
        $("#data").empty();
        $("#sortby").text("");
        var actor = $("#actor_field").val();
        $.get('/movies/actor/'+actor, function(movies){
            movies.sort(function(x,y){return x.critics_score - y.critics_score;}).reverse();
            for(var i in movies){
                if(movies[i].critics_score == -1) {
                    movies[i].critics_score = 'n/a'
                }
                $('<tr><td><a href="'+movies[i].rt_link+'" target="_blank">'+movies[i].title+'</a><span class="right">'+movies[i].critics_score+'</span>'+create_bar(movies[i].critics_score) + "</td></tr>").appendTo("#data").children("tbody");
            }
            $("#sortby").text(actor);
            $("#actor_field").val("");          
        });
    });
    // Handle similar_btn click.
    $('#similar_btn').click(function(){
        $("#data").empty();
        $("#sortby").text("");
        var movie = $("#similar_field").val();
        $.get('/movies/similar/'+movie, function(movies){
            movies.sort(function(x,y){return x.critics_score - y.critics_score;}).reverse();
            for(var i in movies){
                if(movies[i].critics_score == -1) {
                    movies[i].critics_score = 'n/a'
                }
                $('<tr><td><a href="'+movies[i].rt_link+'" target="_blank">'+movies[i].title+'</a><span class="right">'+movies[i].critics_score+'</span>'+create_bar(movies[i].critics_score) + "</td></tr>").appendTo("#data").children("tbody");
            }
            $("#sortby").text(movie);
            $("#similar_field").val("");          
        });
    });
});
