module.exports = function() {
    var module = {};

    module.getIMDBQuote = function(searchWord) {
        var spawn = require('child_process').spawnSync;
        var child = spawn('casperjs' , ['scripts/quote_getter.js', '"'+searchWord+'"']);
        return String(child.stdout);
    };

    return module;
}
