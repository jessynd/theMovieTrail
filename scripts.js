var movieApp = {};
movieApp.api_key = "583095d59a6244694cf1ded79f6826a0";
movieApp.rottenapikey = "kt3fucuxzj9tpcxjpm4vwexh"
movieApp.movieData;
movieApp.trailerObject= [];

movieApp.init = function(){
	movieApp.grabConfig();
	movieApp.getSessionId();
	//listen for a click on our star ratings
	$('body').on('change','input[type=radio]',function(){
		var rating = $(this).val();
		var movieID = $(this).attr('id').split('-')[0].replace('movie','');
		movieApp.ratingHandler(rating,movieID);
		});// click function star rating

	$('select.genreList').change(function(e){
		e.preventDefault();
		var genreId = $(this).find(":selected").val();
		movieApp.grabMoviesbyGenre(genreId);
	});//end form search

	$('body').on('click','.movie',function() {
		var movieid = $(this).data('movieid');
		movieApp.grabYouTube(movieid);
	});

	
	movieApp.grabGenres();
	}; // end movieapp init()

// this function will go to the moviedb api and get all the config data that we need. When it finishes it will put the data it gets onto movieApp.config
movieApp.grabConfig = function(){
	
	var configURL = 'http://api.themoviedb.org/3/configuration';
	$.ajax(configURL,{
		type : 'GET',
		dataType : 'jsonp',
		data : {
			api_key : movieApp.api_key
		}, 
		success : function(config){
			movieApp.config = config;
			
			 //call the next thing to do 
		},
	}); // config ajax
}; // end grabConfig function

movieApp.grabGenres = function(){
	var movieGenres ='http://api.themoviedb.org/3/genre/list'
	$.ajax(movieGenres,{
		type : 'GET',
		dataType : 'jsonp',
		data : {
			api_key : movieApp.api_key
		},
		success : function(data){
			console.log(data),
			movieApp.genres = data.genres,
			movieApp.makeGenreDropdown(movieApp.genres)
			

		},// end success
	});//end ajax movie genres
};// end grab genre function

movieApp.makeGenreDropdown = function(genres) {
	console.log(genres)
	for (var i = 0; i < genres.length; i++) {
		var name = genres[i].name;
		var id = genres[i].id;
		var option = $('<option>').text(name).val(id);
		$('select.genreList').append(option);
	};
};

movieApp.grabMoviesbyGenre = function(genre){
	var movieGenreURL = 'http://api.themoviedb.org/3/genre/' + genre + '/movies';
	$.ajax(movieGenreURL,{
		type : 'GET',
		dataType : 'jsonp',
		data : {
			api_key : movieApp.api_key,

		},
		success : function(data){
			$(".movieContainer").html("");
			movieApp.iframeURL = [];
			movieApp.movieData = data.results;
			movieApp.displayMovies(movieApp.movieData);
			// movieApp.grabYouTube(movieApp.movieData);
			
			

			}		
	}); //end ajax grabMoviesbyGenre
};//end grabMoviesbyGenre function


// For future - grab Youtube trailer link
movieApp.grabYouTube = function(titleId) {

		var movieTrailerURL = "http://api.themoviedb.org/3/movie/" + titleId + "/trailers";
		$.ajax(movieTrailerURL, {
			type : "GET",
			dataType : "jsonp",
			data : {
			api_key : movieApp.api_key

			}, 
			success : function(data) {
				// movieApp.getYouTubeURL(data.youtube)
				// movieApp.displayMovies(movieApp.movieData);
				var youtubeURL = "http://www.youtube.com/embed/" + data.youtube[0].source;
				console.log(youtubeURL);
				var ytiframe = $("<iframe>").attr({
					src : youtubeURL,
					allowfullscreen : "true",
					frameborder : "0"
				}); //end iframe creation
				$('.overlayInner').html(ytiframe);
				$('.overlay2').fadeIn();
				$(".close").on("click", function(){
					$("iframe").attr("src", "");
					$(".overlay2").fadeOut();
				}); //end click x button
			}

		});//end Actor ajax call
	
}; //end grabYouTube 


movieApp.displayMovies = function(movies){
	for (var i = 0; i < movies.length; i++) {

		//TITLE AND IMAGE
		var title = $('<h3>').text( movies[i].original_title );
		var image = $('<img>').attr('src',movieApp.config.images.base_url + "w500" + movies[i].poster_path);

		var box = $("<div>").css("background", "red");

		//CREATE OVERLAY
		overlay = $("<div>").addClass("overlay");

		//RATING THINGY
		var rating = $('fieldset.rateMovie')[0].outerHTML;
		rating = rating.replace(/star/g,'movie' +movies[i].id + '-star');
		rating = rating.replace(/rating/g,'rating-' +movies[i].id);

		//MOVIEWRAP
		var movieWrap = $('<div>').addClass('movie').attr('data-movieid',movies[i].id);

		//YOUTUBE IFRAME
		//I have no idea how to make the videos appear. I need some help. But the idea is that each corresponding YouTube link in my movieApp.trailerObject array should be displayed when someone clicks on the photos. I've gone at this every which way that was suggested but I'm missing something. Help!

		//APPEND THINGS TO THINGS
		movieWrap.append(image);
		movieWrap.append(overlay)
		overlay.append(title,rating);
		$('.movieContainer').append(movieWrap);
	};
}; // end displayMovies

movieApp.ratingHandler = function(rating,movieId){

	$.ajax('http://api.themoviedb.org/3/movie/'+movieId+'/rating',{
		type : 'POST',
		data : {
			api_key : movieApp.api_key,
			guest_session_id : movieApp.session_id,
			value : rating * 2
		},
		success : function(response){
			if(response.status_code){
				alert("Thank you for your vote!");
				// var alertBox = $("<div>").class("alert");
				// alertBox.text("Thank you for your vote!");
				// $("body").append(alertBox.fadeIn());
			}
			else{
				alert(response.status_message);
			}
		}
	});
};// rating handler function

movieApp.getSessionId = function(){
	$.ajax('http://api.themoviedb.org/3/authentication/guest_session/new',{
		data : {
			api_key : movieApp.api_key
		},
		type : 'GET',
		dataType : 'jsonp',
		success : function(session){
			// store the session id for later use
			movieApp.session_id = session.guest_session_id;
			//console.log(session);
		}
	});
}; //end getSession function


// start doc ready
$(function(){
	movieApp.init();
}); //end document ready