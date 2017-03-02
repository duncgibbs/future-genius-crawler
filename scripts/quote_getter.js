var utils = require('../helpers/utils')();
var casper = require('casper').create();
var keyword = casper.cli.get(0);

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

function getTotalQuotes() {
    var summary = document.getElementById('left').innerText;
    var totals = summary.split(' of ');
    return totals.length > 1 ? parseInt(totals[1].replace(',','').split(' ')[0]) : null;
}

casper.start('http://www.imdb.com/search/', function() {
    this.waitForSelector('form[action="/search/text"]');
});

casper.then(function() {
    this.fill('form[action="/search/text"]', {'field': 'quotes', 'q': keyword}, true);
});

casper.then(function() {
    var totalQuotes = this.evaluate(getTotalQuotes);
    if (totalQuotes !== null) {
        var start = utils.randomInt(1, totalQuotes);
        var newUrl = String(this.getCurrentUrl() + '&start=' + start);
        this.open(newUrl);
    }
});

casper.then(function() {
    var quotes = this.evaluate(collectQuotes);
    var chosenQuote = utils.getRandomElements(quotes, 1)[0];
    chosenQuote.keyword = keyword;
    this.echo(JSON.stringify(chosenQuote));
});

casper.run();
