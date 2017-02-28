var utils = require('./helpers/utils');

var casper = require('casper').create();

function collectQuotes() {
    var rows = document.getElementsByTagName('tr');
    return Array.prototype.map.call(rows, function(row){
        if (row.className !== '') {
            var titles = row.getElementsByTagName('a');
            var title = titles[0].innerText;
            var episode = titles.length > 1 ? titles[1].innerText : '';
            var quote = row.getElementsByTagName('div')[0].innerText;
            return {title: title, episode: episode, quote: quote};
        } else {
            return null;
        }
    });
}

casper.start('http://www.imdb.com/search/', function() {
    this.waitForSelector('form[action="/search/text"]');
});

casper.then(function() {
    this.fill('form[action="/search/text"]', {'field': 'quotes', 'q': casper.cli.get(0)}, true);
});

casper.then(function() {
    var quotes = this.evaluate(collectQuotes);
    this.echo(JSON.stringify(utils.getRandomElements(quotes, 1)));
});

casper.run();
