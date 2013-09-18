$(document).ready(function(){
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
    // Get # movies.
    $.get('/movies/count', function(data){
        $("#movie_count").html("<p><b>"+data[0].count+"</b></p>");
    });
    // Get genre stats.
    $.get('/genres/count', function(data){
        data.sort(function(a,b){return parseFloat(a.count)-parseFloat(b.count)}).reverse();
        for(var i=0; i < 5; i++) {
             $("#genre_stats").append("<p><b>"+data[i].count + " " + data[i]._id+"</b></p>");
        }
    });
    // Get actor stats.
    $.get('/actors/count', function(data){
        data.sort(function(a,b){return parseFloat(a.count)-parseFloat(b.count)}).reverse();
        $("#actor_stats").html("<p><b>"+data[0]._id+"</b> who's been in these <b>"+data[0].count+"</b> movies:</p>");
        $.get('/movies/actor/'+data[0]._id, function(movies){
            if(movies.length == 0) {
                    $('<tr><td>No results found</td></tr>').appendTo("#data").children("tbody");
            } else {
                movies.sort(function(x,y){return x.critics_score - y.critics_score;}).reverse();
                for(var i in movies){
                    if(movies[i].critics_score == -1) {
                        movies[i].critics_score = 'n/a'
                    }
                    $('<tr><td><a href="'+movies[i].rt_link+'" target="_blank">'+movies[i].title+'</a><span class="right">'+movies[i].critics_score+'</span>'+create_bar(movies[i].critics_score) + "</td></tr>").appendTo("#top_actor_data").children("tbody");
                }
            }
        });
    });
    // Get highest rated movies.
    $.get('/movies/topten', function(data){
        for(var i in data){
            if(data[i].movie.critics_score == -1) {
                data[i].movie.critics_score = 'n/a'
            }
            $('<tr><td><a href="'+data[i].movie.rt_link+'" target="_blank">'+data[i].movie.title+'</a><span class="right">'+data[i].movie.critics_score+'</span>'+create_bar(data[i].movie.critics_score) + "</td></tr>").appendTo("#top_movie_data").children("tbody");
        }
    });
});
