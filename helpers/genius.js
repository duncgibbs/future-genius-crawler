module.exports = function (accessToken) {
    var database = require('./database')();
    var utils = require('./utils')();
    var Genius = require('node-genius');
    var geniusClient = new Genius(accessToken);
    
    var module = {};

    // because of the genius api we have to paginate through the results to see how many songs there are
    // this is why we will save it for future use
    function getTotalSongCountFromGenius(artistId, page, per_page, resolve) {
        var args = {'page': page, 'per_page': per_page};
        geniusClient.getArtistSongs(artistId, args, function (error, songs) {
            var response = JSON.parse(songs).response;
            if (per_page == 1 && response.next_page === null) {
                var artist = response.songs[0].primary_artist;
                database.insertArtistSongCount(artist.id, page);
                resolve(page);
            } else if (response.next_page === null) {
                var newPage = (page-1)*per_page;
                getTotalSongCountFromGenius(artistId, newPage, 1, resolve);
            } else {
                getTotalSongCountFromGenius(artistId, page+1, per_page, resolve);
            }
        });
    };

    // this is going to see if we have the total song count for an artist saved in the database
    // if we don't, more promises ahoy
    function getArtistSongCount(artistId, callback) {
        database.getArtistSongCount(artistId, function(artist) {
            if (artist) {
                callback(artist.song_count);
            } else {
                new Promise(function(resolve, reject) { 
                    getTotalSongCountFromGenius(artistId, 1, 50, resolve) 
                }).then(function(songCount) {
                    callback(songCount);
                });
            }
        });
    };

    // this is going to grab a random song from the artist, but that has to be inside a promise
    module.getRandomSongFromArtist = function(artistId, callback) {
        getArtistSongCount(artistId, function(songCount) {
            var args = {'page': utils.randomInt(1,songCount), 'per_page': 1};
            geniusClient.getArtistSongs(artistId, args, function (error, songs) {
                var response = JSON.parse(songs).response;
                callback(response.songs[0]);
            });
        });
    };

    module.getRandomLyricFromSong = function(songId, callback) {
        geniusClient.getReferents({"song_id": songId, "text_format": "plain"}, function (error, results) {
            var referents = JSON.parse(results).response.referents
            var randomReferent = utils.getRandomElements(referents, 1);
            callback(randomReferent[0]);
        });
    };

    module.makeAnnotation = function(quote, fragment, annotationUrl) {
        if (quote.episode !== '') {
            var markdown = "From the episode '" + quote.episode 
                + "' from " + utils.getRandomElements(["my", "Future's"], 1) + " favorite show '" + quote.title 
                + "'\n>" + quote.quote;
        } else {
            var markdown = "From " + utils.getRandomElements(["my", "Future's"], 1) + " favorite movie '" + quote.title 
                + "'\n> " + quote.quote;
        }
        console.log('-----');
        console.log('Making annotation: ');
        console.log();
        console.log(markdown);
        console.log();
        geniusClient.createAnnotation({
            "annotation": {
                "body": {
                    "markdown": markdown
                }
            },
            "referent": {
                "raw_annotatable_url": annotationUrl,
                "fragment": fragment
            },
            "web_page": {
                "canonical_url": null,
                "og_url": null
            }
        }, function(error, annotation) {
            console.log('Successfully posted!');
            database.insertQuote(quote, function(result) {
                database.insertAnnotation(annotation.response, result.ops._id);
                console.log('-----');
                console.log('All done.');
            });
        });
    };

    return module;
}
