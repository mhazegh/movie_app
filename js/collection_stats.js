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
    $.get('/actors/topten', function(data){
        for(var i in data) {
             $("#actor_stats").append("<p><b>"+data[i].count + " " + data[i]._id+"</b></p>");
        }    
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
