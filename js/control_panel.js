$(document).ready(function(){
    // Define function to reset fields.
     $("#add_msg").hide();
    var apikey = "5xq9w7z2mp7a6cnchkfy52yd";
    var add_bar_pos = 0;
    var reset = function(){
        $("#add_field").val("");
    };
    var add_to_db = function(movie_obj)
    {
        $.ajax({
            type: 'POST',
            data: JSON.stringify(movie_obj),
            contentType: 'application/json',
            url: 'http://localhost:5000/movies/new',	
            success: function(data) {
            }
        });
        $("#add_msg").show().delay(2000).fadeOut();
        reset();
    };
    reset();
    
    // Get all movies the user owns.
    $.get('/movies', function (titles){
        titles.sort();
        for (i in titles){
            $('<tr><td>'+titles[i]+'</td><td><input type="checkbox" value="1"/></td></td></tr>').appendTo("#movie_table").children("tbody");
        }
    });
    $("#delete_btn").click(function(){
        $('#movie_table input[type=checkbox]:checked').each(function() { 
            var row = $(this).parent().parent();
            var rowcells = row.find('td:first-child');
            rowcells.each(function() {
                var to_remove = {
                    "title": $(this).html()
                };
                $.ajax({
                    type: 'POST',
                    data: JSON.stringify(to_remove),
                    contentType: 'application/json',
                    url: 'http://localhost:5000/movies/delete',
                    success: function(data) {
                    }
                });
                $(this).parent().fadeOut(500);
            });
        });
    }); 
    $('#add_btn').click(function(){
        var title = $("#add_field").val();
        $.ajax("http://api.rottentomatoes.com/api/public/v1.0/movies.json", {
            data: {
                apikey: apikey,
                q: title,
                page_limit: '1'
            },
            dataType:"jsonp",
            success: function(data){
                var movie_obj = {
                    "title" : data['movies'][0]['title'],
                    "id" : parseInt(data['movies'][0]['id']),
                    "critics_score" : data['movies'][0]['ratings']['critics_score'],
                    "audience_score": data['movies'][0]['ratings']['audience_score'],
                    "rt_link": data['movies'][0]['links']['alternate'],
                    "actors": [],
                    "genres": [],
                    "similar": []
                };
                for (i in data['movies'][0]['abridged_cast']){
                    movie_obj['actors'].push(data['movies'][0]['abridged_cast'][i]['name']);
                }
                $.get('/movies/id/'+movie_obj.id, function(data){
                    if(data.length > 0){
                        alert("Movie already added.");
                        reset();
                    } else {
                        var calls_remaining = 2;
                        // Get the genre of the movie.
                        $.ajax("http://api.rottentomatoes.com/api/public/v1.0/movies/"+movie_obj.id+".json", {
                            data: {
                                apikey: apikey,
                            },
                            dataType:"jsonp",
                            success: function(data){
                                if (data['genres'].length > 0){
                                    for(i in data['genres']){           
                                        movie_obj['genres'].push(data['genres'][i]);
                                    }
                                }
                                --calls_remaining;
                                if (calls_remaining == 0){
                                    add_to_db(movie_obj);
                                }
                            }
                        });
                        // Get similar movies.
                        $.ajax("http://api.rottentomatoes.com/api/public/v1.0/movies/"+movie_obj.id+"/similar.json", {
                            data: {
                                apikey: apikey,
                            },
                            dataType:"jsonp",
                            success: function(data){
                                if (data['movies'].length > 0){
                                    for(i in data['movies']){           
                                        movie_obj['similar'].push(data['movies'][i]['title']);
                                    }
                                }
                                --calls_remaining;
                                if (calls_remaining == 0){
                                    add_to_db(movie_obj);
                                }
                            }
                        });
                    }
                });
            }
        });
    });
});
