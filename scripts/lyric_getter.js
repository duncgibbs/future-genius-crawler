var utils = require('../helpers/utils')();
var casper = require('casper').create();
var lyricsUrl = casper.cli.get(0);

function collectLyrics() {
    var lyrics = document.getElementsByClassName('song_body-lyrics')[0].getElementsByTagName('p')[0].innerText;
    return lyrics.split("\n");
}

function filterLines(lines) {
    var results = lines.filter(function(line) { return line.indexOf('['); });
    results = results.filter(function(line) { return line !== ''; });
    return results;
}

casper.start(lyricsUrl, function() {
    this.waitForSelector('.song_body-lyrics', function() {
        var lines = filterLines(this.evaluate(collectLyrics));
        this.echo(utils.getRandomElements(lines, 1));
    });
});

casper.run();
