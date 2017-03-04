var utils = require('./helpers/utils')();
var accessToken = utils.getAccessToken();
var genius = require('./helpers/genius')(accessToken);
var config = require('./config');
var casperHelpers = require('./helpers/casper_helper')();

function randomSong(resolve) {
    console.log('-----');
    console.log('Getting random song...');
    genius.getRandomSongFromArtist(config.future_api_id, resolve);
}

function randomLine(songUrl) {
    return casperHelpers.getRandomLyric(songUrl);
}

function randomQuote(line) {
    var randomWord = utils.getRandomWord(line);
    console.log('-----');
    console.log('Getting random quote:');
    console.log("\tFor keyword: " + randomWord);
    console.log("\tFrom line: " + line);
    return JSON.parse(casperHelpers.getIMDBQuote(randomWord));
}

function annotateLyric(quote, line, annotationUrl) {
    genius.makeAnnotation(quote, line, annotationUrl);
}

function run() {
    randomSong(function(song) {
        var lyricLine = randomLine(song.url);
        var quote;
        do {
            quote = randomQuote(lyricLine);
        } while (typeof(quote.title) === 'undefined' && typeof(quote.quote) === 'undefined');
        annotateLyric(quote, lyricLine, song.url);
    });
}

run();
