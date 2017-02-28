var genius = require('./helpers/genius');
var config = require('./config');
var utils = require('./helpers/utils');

var Genius = require('node-genius');
var geniusClient = new Genius(config.access_token);

genius.getRandomSongFromArtist(config.future_api_id, function(song) {
    genius.getRandomLyricFromSong(song.id, function(referent) {
        var lyrics = referent.fragment;
        var words = utils.cleanupLyrics(lyrics).split(' ');
        console.log(utils.getRandomElements(words, 2).join(' ') + ' - from "' + referent.fragment + '"');
    });
});

