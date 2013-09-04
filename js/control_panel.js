$(document).ready(function(){
    var apikey = "c5w6fkff8zsj4mjp48ztxx3u";
    var add_bar_pos = 0;
    
    // Function to reset fields.
    var reset = function(){
        $("#add_field").val("");
    };
    
    reset();

    // Function to add a movie to the sorted movie table.
    var add_to_table = function(title_to_add)
    {
        if($('#movie_table tr').length === 0) {
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
        return;
    };

    // Function to add a movie to the database.
    var add_to_db = function(movie_obj)
    {
        $.get('/movies/id/'+movie_obj.id, function(data){
            if(data.length === 0){
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
            }
            // Reset the movie field.
            reset();
        });
    };
    
    // Get all movies the user owns.
    $.get('/movies', function (titles){
        titles.sort();
        for (var i in titles){
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

    var add_from_autocomplete = function(movie_obj) {
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
                    data: { apikey: apikey },
                    dataType:"jsonp",
                    success: function(data){
                        if (data.genres.length > 0){
                            for(var i in data.genres){           
                                movie_obj.genres.push(data.genres[i]);
                            }
                        }
                        --calls_remaining;
                        if (calls_remaining === 0){
                            add_to_db(movie_obj);
                        }
                    }
                 });
                 // Get similar movies.
                 $.ajax("http://api.rottentomatoes.com/api/public/v1.0/movies/"+movie_obj.id+"/similar.json", {
                     data: { apikey: apikey},
                     dataType:"jsonp",
                     success: function(data) {
                         if (data.movies.length > 0){
                             for(var i in data.movies){           
                                 movie_obj.similar.push(data.movies[i].title);
                             }
                         }
                         --calls_remaining;
                         if (calls_remaining === 0){
                             add_to_db(movie_obj);
                         }
                      }
                });
          }
        });
    };

    var add_movie = function(title) {
        console.log(title);
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
                    "title" : data.movies[0].title,
                    "id" : parseInt(data.movies[0].id, 10),
                    "critics_score" : data.movies[0].ratings.critics_score,
                    "audience_score": data.movies[0].ratings.audience_score,
                    "rt_link": data.movies[0].links.alternate,
                    "actors": [],
                    "genres": [],
                    "similar": []
                };
                for (var i in data.movies[0].abridged_cast){
                    movie_obj.actors.push(data.movies[0].abridged_cast[i].name);
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
                                if (data.genres.length > 0){
                                    for(var i in data.genres){           
                                        movie_obj.genres.push(data.genres[i]);
                                    }
                                }
                                --calls_remaining;
                                if (calls_remaining === 0){
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
                                if (data.movies.length > 0){
                                    for(var i in data.movies){           
                                        movie_obj.similar.push(data.movies[i].title);
                                    }
                                }
                                --calls_remaining;
                                if (calls_remaining === 0){
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
       add_movie($("#add_field").val());
    });

    $("#add_field").keypress(function(e){
        if(e.which == 13) {
            add_movie($("#add_field").val());
        }
    });

    // Setup autocompelte from RT.
    $('#add_field').autocomplete({
        source: function(req, res) 
        {
            $.ajax("http://api.rottentomatoes.com/api/public/v1.0/movies.json", {
                data:{
                    apikey:apikey,
                    q:req.term,
                    page_limit: '10'
                },
                dataType: "jsonp",
                success: function(data) {
                    res($.map(data.movies, function(movie) {
                        var movie_obj = {
                             value: movie.title,
                             id: parseInt(movie.id,10),
                             title: movie.title,
                             critics_score:movie.ratings.critics_score,
                             audience_score:movie.ratings.audience_score,
                             rt_link:movie.links.alternate,
                             thumb: movie.posters.thumbnail, 
                             actors:[],
                             genres:[],
                             similar:[]
                        };
                        for (var i in movie.abridged_cast){
                            movie_obj.actors.push(movie.abridged_cast[i].name);
                        }
                        return movie_obj;
                    }));
                }
            });
        },
        messages: {
            noResults:'',
            results: function(){}
        },
        select:function(event, ui) {
                    add_from_autocomplete(ui.item);
                }
    }).data("uiAutocomplete")._renderItem = function(ul, item) {
        var link = $("<a>").text(item.title);
        return $("<li>")
            .data("item.autocomplete", item)
            .append(link)
            .appendTo(ul);
    };

    $('#upload_form').submit(function(event) {
        event.preventDefault();
        var file = document.getElementById('picked_file').files[0];
        var reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = parseMovies;
    });

    function parseMovies(event) {
        var result = event.target.result;
        var movie_list = result.split("\n");
        var wait_time = 0;
        for (var i in movie_list) {
            if(movie_list[i].length > 0) {
                var cur_movie = movie_list[i].trim();
                if(cur_movie.endsWith('.avi') || 
                   cur_movie.endsWith('.mp4') || 
                   cur_movie.endsWith('.mov') || 
                   cur_movie.endsWith('.mpg') ||
                   cur_movie.endsWith('.mkv') ||
                   cur_movie.endsWith('.flv') ||
                   cur_movie.endsWith('.wmv') ||
                   cur_movie.endsWith('.m4a')) {
                    cur_movie = cur_movie.substr(0, cur_movie.length - 4);
                }
                timedAdd(cur_movie, wait_time);
            }
            wait_time += 333;
        }
    }

    function timedAdd(title, wait_time){
        setTimeout(add_movie, wait_time, title);
    }

    $('#to_top_btn').click(function(){
        $("html, body").animate({scrollTop:0},1000);
    });
});
