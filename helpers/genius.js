var database = require('./database');
var utils = require('./utils');
var config = require('../config');

var Genius = require('node-genius');
var geniusClient = new Genius(config.access_token);


var getTotalSongCount = function(artistId, page, per_page, resolve) {
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
}

module.exports = {
    getArtistSongCount: function(artistId, callback) {
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
    },

    getRandomSongFromArtist: function(artistId, callback) {
        this.getArtistSongCount(artistId, function(songCount) {
            var args = {'page': utils.randomInt(1,songCount), 'per_page': 1};
            geniusClient.getArtistSongs(artistId, args, function (error, songs) {
                var response = JSON.parse(songs).response;
                callback(response.songs[0]);
            });
        });
    },

    getRandomLyricFromSong: function(songId, callback) {
        geniusClient.getReferents({"song_id": songId, "text_format": "plain"}, function (error, results) {
            var referents = JSON.parse(results).response.referents
            var randomReferent = utils.getRandomElements(referents, 1);
            callback(randomReferent[0]);
        });
    }
}
