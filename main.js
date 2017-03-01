var utils = require('./helpers/utils');
var accessToken = utils.getAccessToken();
var genius = require('./helpers/genius')(accessToken);
var config = require('./config');
var casperHelpers = require('./helpers/casper_helper');
var database = require('./helpers/database');

function getRandomWord(referent) {
    var lyrics = referent.fragment;
    var words = utils.cleanupString(lyrics).split(' ');
    var randomWord = String(utils.getRandomElements(words, 1));
    console.log(randomWord + ' - from "' + referent.fragment + '"');
    return randomWord;
}

genius.getRandomSongFromArtist(config.future_api_id, function(song) {
    genius.getRandomLyricFromSong(song.id, function(referent) {
        var randomWord = getRandomWord(referent);
        var quote = JSON.parse(casperHelpers.getIMDBQuote(randomWord))[0];
        database.insertQuote(randomWord, quote);
        genius.makeAnnotation(quote, referent);
    });
});
