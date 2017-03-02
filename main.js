var utils = require('./helpers/utils')();
var accessToken = utils.getAccessToken();
var genius = require('./helpers/genius')(accessToken);
var config = require('./config');
var casperHelpers = require('./helpers/casper_helper')();
var database = require('./helpers/database')();

function getRandomWord(lyrics) {
    var words = utils.cleanupString(lyrics).split(' ');
    var randomWord = String(utils.getRandomElements(words, 1));
    console.log('Keyword: "' + randomWord + '"');
    console.log('From: "' + lyrics.replace("\n","") + '"');
    return randomWord;
}

genius.getRandomSongFromArtist(config.future_api_id, function(song) {
    var fragment = casperHelpers.getRandomLyric(song.url);
    var randomWord = getRandomWord(fragment);
    var quote = JSON.parse(casperHelpers.getIMDBQuote(randomWord));
    if (typeof(quote.title) !== 'undefined' && typeof(quote.quote) !== 'undefined') {
        genius.makeAnnotation(quote, song.url, fragment);
        console.log('Success!');
    } else {
        console.log('Error: ' + quote);
    }
});

