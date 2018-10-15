require("dotenv").config();
var moment = require("moment");
var keys = require("./keys.js");
var request = require("request");
var Spotify = require("node-spotify-api");
var fs = require("fs");
var spotify = new Spotify({
    id: keys.spotify.id,
    secret: keys.spotify.secret
});

if (process.argv[2]) {
    var command = process.argv[2];
} else {
    console.log("Please enter a command.")
}
var query = "";

function findConcerts(artist) {
    var bandsURL = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";
    request(bandsURL, function (err, response, body) {
        if (err) {
            return console.log(err);
        }
        var bodyObj = JSON.parse(body);
        for (var i = 0; i < bodyObj.length; i++) {
            console.log("-----------------------------------------");
            console.log("Venue: " + bodyObj[i].venue.name);
            console.log("Venue Location: " + bodyObj[i].venue.city);
            console.log("Date: " + moment(bodyObj[i].datetime).format("MM/DD/YYYY"));
        }
    });
}

function searchSpotify(song) {
    spotify.search({
        type: 'track',
        query: song,
    }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        var artistArr = [];
        for (var j = 0; j < data.tracks.items[0].artists.length; j++) {
            artistArr.push(data.tracks.items[0].artists[j].name);
        }
        console.log("-----------------------------------------");
        console.log("Artist(s): " + artistArr.join(", "));
        console.log("Song name: " + data.tracks.items[0].name);
        if (data.tracks.items[0].external_urls.preview_url) {
            var previewURL = data.tracks.items[0].external_urls.preview_url;
            console.log("Preview the song: " + previewURL);
        } else {
            var fullSongURL = data.tracks.items[0].external_urls.spotify;
            console.log("Link to the full song: " + fullSongURL);
        }
        console.log("Album: " + data.tracks.items[0].album.name);
        console.log("-----------------------------------------");
    });
}

function findMovie(movie) {
    var movieURL = "https://www.omdbapi.com/?apikey=trilogy&t=" + movie;
    request(movieURL, function (err, response, body) {
        if (err) {
            return console.log(err);
        }
        var parsedReponse = JSON.parse(body);
        console.log(
            `-----------------------------------------
Title: ${parsedReponse.Title}
Year: ${parsedReponse.Year}
IMBD Rating: ${parsedReponse.imbdRating}
Rotten Tomatoes Rating: ${parsedReponse.Ratings[1].Value}
Country: ${parsedReponse.Country}
Language: ${parsedReponse.Language}
Plot: ${parsedReponse.Plot}
Actors: ${parsedReponse.Actors}`
        );
    });
}

if (command === "concert-this") {
    if (process.argv[3]) {
        query = process.argv.slice(3).join("");
    } else {
        console.log("Please enter a search term.");
    }
    findConcerts(query);
} else if (command === "spotify-this-song") {
    if (process.argv[3]) {
        query = process.argv.slice(3).join("-");
    } else {
        console.log("Please enter a search term.");
    }
    searchSpotify(query);
} else if (command === "movie-this") {
    if (process.argv[3]) {
        query = process.argv.slice(3).join("-");
    } else {
        console.log("Please enter a search term.");
    }
    findMovie(query);
} else if (command === "do-what-it-says") {
    fs.readFile("./random.txt", "utf8", function (err, data) {
        if (err) {
            return console.log(err);
        }
        dataArr = data.split(",");
        command = dataArr[0];
        query = dataArr[1];
        query = query.replace('"', '');
        query = query.replace('"', '');
        if (command === "concert-this") {
            findConcerts(query);
        } else if (command === "spotify-this-song") {
            searchSpotify(query);
        } else if (command === "movie-this") {
            findMovie(query);
        } else {
            console.log("File is empty or the command is unrecognized.");
        }
    });
} else console.log("Please ender a valid command.");