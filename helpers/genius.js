module.exports = function (accessToken) {
    var database = require('./database')();
    var utils = require('./utils')();
    var Genius = require('node-genius');
    var geniusClient = new Genius(accessToken);
    
    var module = {};

    function getTotalSongCount(artistId, page, per_page, resolve) {
        var args = {'page': page, 'per_page': per_page};
        geniusClient.getArtistSongs(artistId, args, function (error, songs) {
            var response = JSON.parse(songs).response;
            if (per_page == 1 && response.next_page === null) {
                var artist = response.songs[0].primary_artist;
                database.insertArtistSongCount(artist.id, page);
                resolve(page);
            } else if (response.next_page === null) {
                var newPage = (page-1)*per_page;
                getTotalSongCount(artistId, newPage, 1, resolve);
            } else {
                getTotalSongCount(artistId, page+1, per_page, resolve);
            }
        });
    };

    function getArtistSongCount(artistId, callback) {
        database.getArtistSongCount(artistId, function(artist) {
            if (artist) {
                callback(artist.song_count);
            } else {
                new Promise(function(resolve, reject) { 
                    getTotalSongCount(artistId, 1, 50, resolve) 
                }).then(function(songCount) {
                    callback(songCount);
                });
            }
        });
    };

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

    module.makeAnnotation = function(quote, referent) {
        if (quote.episode !== '') {
            var markdown = "From the episode '" + quote.episode 
                + "' from " + utils.getRandomElements(["my", "Future's"], 1) + " favorite show '" + quote.title 
                + "'\n>" + quote.quote;
        } else {
            var markdown = "From " + utils.getRandomElements(["my", "Future's"], 1) + " favorite movie '" + quote.title 
                + "'\n> " + quote.quote;
        }
        console.log('Making annotation: ');
        console.log(markdown);
        geniusClient.createAnnotation({
            "annotation": {
                "body": {
                    "markdown": markdown
                }
            },
            "referent": {
                "raw_annotatable_url": referent.annotatable.url,
                "fragment": referent.fragment
            },
            "web_page": {
                "canonical_url": null,
                "og_url": null
            }
        }, function(error, annotation) {
            console.log(annotation || error);
        });
    };

    return module;
}
