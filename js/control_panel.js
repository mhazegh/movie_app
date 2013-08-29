$(document).ready(function(){
    var apikey = "5xq9w7z2mp7a6cnchkfy52yd";
    var add_bar_pos = 0;
    
    // Function to reset fields.
    var reset = function(){
        $("#add_field").val("");
    };
    
    // Function to add a movie to the sorted movie table.
    var add_to_table = function(title_to_add)
    {
        if($('#movie_table tr').length == 0) {
            $('#movie_table').find('tbody').append('<tr><td><input type="checkbox" value="1"/></td><td>'+title_to_add+'</td></tr>');
            return;
       }
       var not_found = true;
       $('#movie_table tbody tr').each(function() {
            var data = $(this).find('td:first-child').next();
            data.each(function() {
                if ($(this).html() >= title_to_add) {
                    $(this).parent().before('<tr><td><input type="checkbox" value="1"/></td><td>'+title_to_add+'</td></tr>'); 
                    not_found = false;
                    return false;
                }
            });
            return not_found; 
        }); 
        if(not_found)
        {
            $('#movie_table').find('tbody:last').append('<tr><td><input type="checkbox" value="1"/></td><td>'+title_to_add+'</td></tr>');
        } 
    };

    // Function to add a movie to the database.
    var add_to_db = function(movie_obj)
    {
        $.ajax({
            type: 'POST',
            data: JSON.stringify(movie_obj),
            contentType: 'application/json',
            url: '/movies/new',	
            success: function(data) {
            }
        });
        $("#status_msg").stop(true).text("'" + movie_obj.title + "'" + " added");
        $("#status_msg").fadeTo(1500,1,function() {
            $(this).fadeTo(1000,0);
        });

        // After a movie is added, update the movie table.
        add_to_table(movie_obj.title);    
        // Reset the movie field.
        reset();
    };
    reset();
    
    // Get all movies the user owns.
    $.get('/movies', function (titles){
        titles.sort();
        for (i in titles){
            $('<tr><td><input type="checkbox" value="1"/></td><td>'+titles[i]+'</td></tr>').appendTo("#movie_table").children("tbody");
        }
    });

    // Handle deleting movies.
    $("#delete_btn").click(function(){
        $('#movie_table input[type=checkbox]:checked').each(function() { 
            var row = $(this).parent().parent();
            var rowcells = row.find('td:first-child').next();
            rowcells.each(function() {
                var to_remove = {
                    "title": $(this).html()
                };
                $.ajax({
                    type: 'POST',
                    data: JSON.stringify(to_remove),
                    contentType: 'application/json',
                    url: '/movies/delete',
                    success: function(data) {
                    }
                });
                $(this).parent().fadeOut(500, function() {
                    $(this).remove();
                });
            });
        });
    }); 
    var add_movie = function() {
        var title = $("#add_field").val();
        $.ajax("http://api.rottentomatoes.com/api/public/v1.0/movies.json", {
            data: {
                apikey: apikey,
                q: title,
                page_limit: '1'
            },
            dataType:"jsonp",
            success: function(data){
                if(data.total < 1) {
                    $("#status_msg").stop(true).text("Could not get data for " + "'" + title + '"');
                    $("#status_msg").fadeTo(1500,1,function() {
                        $(this).fadeTo(1000,0);
                    });
                    reset();
                    return;
                }
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
                        $("#status_msg").stop(true).text("'" + movie_obj.title + "'" + " already exists");
                        $("#status_msg").fadeTo(1500,1,function() {
                            $(this).fadeTo(1000,0);
                        });
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
    };

    // Handle adding movies.
    $('#add_btn').click(function(){
       add_movie();
    });

    $("#add_field").keypress(function(e){
        if(e.which == 13)
        {
            add_movie();
        }
    });

});
